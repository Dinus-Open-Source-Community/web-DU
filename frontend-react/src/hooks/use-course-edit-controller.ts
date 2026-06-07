import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  addLesson,
  findModuleByLessonId,
  getFirstLessonId,
  removeLesson,
  removeModule,
  renameModule,
} from "@/lib/course-curriculum";
import { isCoursePublished } from "@/lib/course-detail/publish-state";
import { switchLessonDeliveryType } from "@/lib/course-edit/switch-lesson-delivery-type";
import {
  findModuleForLesson,
  getFirstEditableLessonId,
  mergeModuleLessonsFromApi,
  remapLessonIdInModules,
  toModuleShell,
  collectPersistedLessonKeys,
} from "@/lib/course-edit/merge-module-lessons";
import { persistLesson } from "@/lib/course-edit/persist-lesson";
import {
  createPersistedModule,
  deletePersistedModule,
  isOnlyUnpersistedFallbackModule,
  normalizeModuleTitle,
  updatePersistedModule,
} from "@/lib/course-edit/persist-module";
import {
  createFallbackModule,
  findLesson,
  getLessonKey,
  mergeOutlineModules,
  mergeLessonDetailFromApi,
  toLesson,
  toMentorCourse,
  toOutlineModules,
} from "@/lib/course-edit/mappers";
import {
  applyHomeworkFromAssignment,
  ensureHomeworkDefaults,
  isHomeworkConfigured,
} from "@/lib/course-edit/homework";
import {
  clearHomeworkFromLesson,
  validateHomeworkForSave,
} from "@/lib/course-edit/homework-rules";
import {
  useDeleteLessonAssignment,
  useSaveLessonAssignment,
} from "@/hooks/use-lesson-assignment-admin";
import type {
  CourseEditClientProps,
  EditableLesson,
  EditableModule,
  LessonApiItem,
} from "@/lib/course-edit/types";
import type {
  ICourseDetailItem,
  ICourseDetailModule,
} from "@/lib/types/course";
import { courseKeys, lessonAssignmentKeys, lessonKeys, moduleKeys } from "@/hooks/query-keys";
import { useUpdateCourseStatus } from "@/hooks/use-course-mutations";
import { useLessonAssignmentAdmin } from "@/hooks/use-lesson-assignment-admin";
import { useLessonByUid, useLessonsByModule } from "@/hooks/use-lessons";
import { deleteLesson, updateLesson } from "@/services/lessons";

type PendingNavigation =
  | { type: "lesson"; lessonId: string; label: string }
  | { type: "module"; moduleId: string; label: string };

export function useCourseEditController({
  initialModuleId,
  routeBasePath = "/mentor",
  courseData,
  modules: sourceModules,
}: CourseEditClientProps) {
  const queryClient = useQueryClient();
  const updateCourseStatus = useUpdateCourseStatus();

  const [course, setCourse] = useState<Partial<ICourseDetailItem> | null>(null);
  const [modules, setModules] = useState<EditableModule[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [loadedModuleIds, setLoadedModuleIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [renameModuleId, setRenameModuleId] = useState<string | null>(null);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [isModuleMutating, setIsModuleMutating] = useState(false);
  const [editorReady, setEditorReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modifiedLessons, setModifiedLessons] = useState<Set<string>>(
    new Set(),
  );
  const [modifiedAssignmentLessons, setModifiedAssignmentLessons] = useState<
    Set<string>
  >(new Set());
  const [modifiedModuleUids, setModifiedModuleUids] = useState<Set<string>>(
    new Set(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation | null>(null);

  const persistedModuleUidsRef = useRef<Set<string>>(new Set());
  const [persistedLessonUids, setPersistedLessonUids] = useState<Set<string>>(
    () => new Set(),
  );
  const initialLessonModuleMapRef = useRef<Map<string, string>>(new Map());
  const lastHydratedLessonRef = useRef<string | null>(null);
  const lastHydratedAssignmentRef = useRef<string | null>(null);

  const shouldLoadAssignment = Boolean(
    activeLessonId &&
      persistedLessonUids.has(activeLessonId) &&
      !modifiedAssignmentLessons.has(activeLessonId),
  );

  const assignmentQuery = useLessonAssignmentAdmin(
    shouldLoadAssignment ? activeLessonId : null,
    shouldLoadAssignment,
  );

  const hasCourseModules = sourceModules.length > 0;

  const moduleLessonsQuery = useLessonsByModule(activeModuleId ?? "", {
    per_page: 100,
  });

  const shouldLoadLessonDetail = Boolean(
    activeLessonId &&
    persistedLessonUids.has(activeLessonId) &&
    !modifiedLessons.has(activeLessonId),
  );

  const lessonDetailQuery = useLessonByUid(
    shouldLoadLessonDetail ? activeLessonId! : "",
  );

  const outlineModules = useMemo(() => toOutlineModules(modules), [modules]);

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    return findLesson(modules, activeLessonId);
  }, [modules, activeLessonId]);

  const activeOutlineModule = useMemo(() => {
    if (outlineModules.length === 0) return null;
    return (
      outlineModules.find((module) => module.uid === activeModuleId) ??
      outlineModules[0]
    );
  }, [outlineModules, activeModuleId]);

  const renameModuleTitle =
    outlineModules.find((module) => module.uid === renameModuleId)?.title ?? "";

  const deleteModuleTitle =
    outlineModules.find((module) => module.uid === deleteModuleId)?.title ?? "";

  const activeLessonModified = Boolean(
    activeLessonId && modifiedLessons.has(activeLessonId),
  );

  const activeAssignmentModified = Boolean(
    activeLessonId && modifiedAssignmentLessons.has(activeLessonId),
  );

  const saveAssignmentMutation = useSaveLessonAssignment();
  const deleteAssignmentMutation = useDeleteLessonAssignment(
    activeLesson?.uid ?? null,
  );

  const isModuleLessonsLoading = Boolean(
    activeModuleId &&
    moduleLessonsQuery.isLoading &&
    !loadedModuleIds.has(activeModuleId),
  );

  useEffect(() => {
    if (courseData && typeof courseData === "object") {
      setCourse(toMentorCourse(courseData as ICourseDetailItem));
      return;
    }
    setCourse(null);
  }, [courseData]);

  useEffect(() => {
    if (isInitialized || !courseData || typeof courseData !== "object") return;

    if (!hasCourseModules) {
      const fallbackModule = createFallbackModule(1);
      setModules([fallbackModule]);
      setActiveModuleId(fallbackModule.uid ?? null);
      setActiveLessonId(getLessonKey(fallbackModule.lessons[0]));
      setEditorReady(true);
      setIsInitialized(true);
      return;
    }

    const nextModules = sourceModules.map((module, index) =>
      toModuleShell(module, index + 1),
    );

    setModules(nextModules);

    const initialModule =
      (initialModuleId
        ? nextModules.find((module) => module.uid === initialModuleId)
        : undefined) ?? nextModules[0];

    setActiveModuleId(initialModule?.uid ?? null);
    setActiveLessonId(null);
    setEditorReady(false);
    setIsInitialized(true);

    persistedModuleUidsRef.current = new Set(
      sourceModules.map((module) => module.uid).filter(Boolean),
    );
    setPersistedLessonUids(new Set());
    initialLessonModuleMapRef.current = new Map();
  }, [
    isInitialized,
    sourceModules,
    initialModuleId,
    courseData,
    hasCourseModules,
  ]);

  useEffect(() => {
    if (!activeModuleId || !moduleLessonsQuery.data) return;

    const apiLessons = moduleLessonsQuery.data.lessons ?? [];

    setModules((previous) => {
      const merged = mergeModuleLessonsFromApi(
        previous,
        activeModuleId,
        apiLessons,
      );

      setActiveLessonId((current) => {
        const targetModule = merged.find(
          (module) => module.uid === activeModuleId,
        );
        if (
          current &&
          targetModule?.lessons.some(
            (lesson) => getLessonKey(lesson) === current,
          )
        ) {
          return current;
        }
        return (
          apiLessons[0]?.uid ?? getFirstEditableLessonId(targetModule!) ?? null
        );
      });

      return merged;
    });

    setLoadedModuleIds((previous) => new Set([...previous, activeModuleId]));

    setPersistedLessonUids((previous) => {
      const next = new Set(previous);
      for (const lesson of apiLessons) {
        next.add(lesson.uid);
        initialLessonModuleMapRef.current.set(lesson.uid, activeModuleId);
      }
      return next;
    });

    setEditorReady(true);
  }, [activeModuleId, moduleLessonsQuery.data]);

  useEffect(() => {
    if (!shouldLoadLessonDetail || !lessonDetailQuery.data || !activeLessonId)
      return;
    if (modifiedLessons.has(activeLessonId)) return;
    if (lastHydratedLessonRef.current === activeLessonId) return;

    const lessonApiItem = lessonDetailQuery.data as LessonApiItem;
    const hydrated = toLesson(
      lessonApiItem,
      Number(lessonApiItem.order_index ?? 1) || 1,
    );

    lastHydratedLessonRef.current = activeLessonId;
    setModules((previous) =>
      previous.map((courseModule) => ({
        ...courseModule,
        lessons: courseModule.lessons.map((lesson) => {
          const lessonKey = getLessonKey(lesson);
          if (lessonKey !== activeLessonId) return lesson;
          return mergeLessonDetailFromApi(
            lesson,
            hydrated,
            lessonApiItem.uid,
          );
        }),
      })),
    );
  }, [
    activeLessonId,
    lessonDetailQuery.data,
    modifiedLessons,
    shouldLoadLessonDetail,
  ]);

  useEffect(() => {
    lastHydratedLessonRef.current = null;
    lastHydratedAssignmentRef.current = null;
  }, [activeLessonId]);

  useEffect(() => {
    if (!shouldLoadAssignment || !activeLessonId) return;
    if (!assignmentQuery.isFetched) return;
    if (modifiedAssignmentLessons.has(activeLessonId)) return;
    if (lastHydratedAssignmentRef.current === activeLessonId) return;

    lastHydratedAssignmentRef.current = activeLessonId;
    const assignment = assignmentQuery.data ?? null;

    setModules((previous) =>
      previous.map((courseModule) => ({
        ...courseModule,
        lessons: courseModule.lessons.map((lesson) => {
          const lessonKey = getLessonKey(lesson);
          if (lessonKey !== activeLessonId) return lesson;
          return applyHomeworkFromAssignment(lesson, assignment);
        }),
      })),
    );
  }, [
    activeLessonId,
    assignmentQuery.data,
    assignmentQuery.isFetched,
    modifiedAssignmentLessons,
    shouldLoadAssignment,
  ]);

  const patchLocalLesson = useCallback(
    (lessonId: string, updater: (lesson: EditableLesson) => EditableLesson) => {
      setModules((previous) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const lessonKey = getLessonKey(lesson);
            if (lessonKey !== lessonId && lesson.id !== lessonId) return lesson;
            setModifiedLessons((prev) => new Set([...prev, lessonKey]));
            return updater(lesson);
          }),
        })),
      );
    },
    [],
  );

  const patchAssignmentLesson = useCallback(
    (lessonId: string, updater: (lesson: EditableLesson) => EditableLesson) => {
      setModules((previous) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const lessonKey = getLessonKey(lesson);
            if (lessonKey !== lessonId && lesson.id !== lessonId) return lesson;
            setModifiedAssignmentLessons((prev) => new Set([...prev, lessonKey]));
            return updater(lesson);
          }),
        })),
      );
    },
    [],
  );

  const handleModulesChange = useCallback(
    (nextOutlineModules: ICourseDetailModule[]) => {
      setModules((previous) =>
        mergeOutlineModules(previous, nextOutlineModules),
      );
    },
    [],
  );

  const applyOutlineUpdate = useCallback(
    (updater: (current: ICourseDetailModule[]) => ICourseDetailModule[]) => {
      handleModulesChange(updater(outlineModules));
    },
    [handleModulesChange, outlineModules],
  );

  const invalidateModuleQueries = useCallback(
    async (courseUid: string, moduleUid?: string) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: moduleKeys.all }),
        queryClient.invalidateQueries({
          queryKey: courseKeys.detail(courseUid),
        }),
        ...(moduleUid
          ? [
              queryClient.invalidateQueries({
                queryKey: lessonKeys.byModule(moduleUid),
              }),
            ]
          : []),
      ]);
    },
    [queryClient],
  );

  const moduleHasUnsavedLessons = useCallback(
    (moduleId: string) => {
      const targetModule = modules.find((module) => module.uid === moduleId);
      if (!targetModule) return false;

      return targetModule.lessons.some((lesson) =>
        modifiedLessons.has(getLessonKey(lesson)),
      );
    },
    [modules, modifiedLessons],
  );

  const saveLesson = useCallback(
    async (
      lessonId: string,
      opts?: { silent?: boolean; lesson?: EditableLesson },
    ) => {
      if (isSaving) return false;

      const lesson = opts?.lesson ?? findLesson(modules, lessonId);
      const moduleForLesson = findModuleForLesson(modules, lessonId);

      if (!lesson || !moduleForLesson?.uid) {
        throw new Error("Lesson tidak ditemukan.");
      }

      setIsSaving(true);
      try {
        const courseUid = courseData.uid;
        if (!courseUid) throw new Error("UID kursus tidak ditemukan.");

        const result = await persistLesson({
          courseUid,
          module: moduleForLesson,
          lesson,
          persistedModuleUids: persistedModuleUidsRef.current,
          persistedLessonUids: new Set(persistedLessonUids),
          modifiedModuleUids: new Set(modifiedModuleUids),
        });

        setModules((previous) => {
          let next = previous.map((module) => {
            if (module.uid !== moduleForLesson.uid) return module;
            return {
              ...result.module,
              lessons: module.lessons.map((item) =>
                getLessonKey(item) === result.previousLessonId
                  ? result.lesson
                  : item,
              ),
            };
          });

          if (result.previousLessonId !== result.nextLessonId) {
            next = remapLessonIdInModules(
              next,
              result.previousLessonId,
              result.nextLessonId,
            );
          }

          return next;
        });

        setPersistedLessonUids((previous) => {
          const next = new Set(previous);
          next.delete(result.previousLessonId);
          next.add(result.nextLessonId);
          return next;
        });

        initialLessonModuleMapRef.current.set(
          result.nextLessonId,
          result.module.uid ?? moduleForLesson.uid!,
        );

        setModifiedLessons((previous) => {
          const next = new Set(previous);
          next.delete(result.previousLessonId);
          next.delete(result.nextLessonId);
          return next;
        });

        setModifiedModuleUids((previous) => {
          const next = new Set(previous);
          if (result.module.uid) next.delete(result.module.uid);
          return next;
        });

        if (activeLessonId === result.previousLessonId) {
          setActiveLessonId(result.nextLessonId);
        }

        if (result.createdModuleUid) {
          setActiveModuleId(result.createdModuleUid);
        }

        lastHydratedLessonRef.current = result.nextLessonId;

        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: lessonKeys.byModule(
              result.module.uid ?? activeModuleId ?? '',
            ),
          }),
          queryClient.invalidateQueries({
            queryKey: lessonKeys.detail(result.nextLessonId),
          }),
          queryClient.invalidateQueries({
            queryKey: lessonAssignmentKeys.detail(result.nextLessonId),
          }),
          queryClient.invalidateQueries({ queryKey: moduleKeys.all }),
          queryClient.invalidateQueries({
            queryKey: courseKeys.detail(courseUid),
          }),
        ])

        if (!opts?.silent) toast.success("Lesson berhasil disimpan.");
        return true;
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal menyimpan lesson.",
        );
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [
      activeLessonId,
      activeModuleId,
      courseData.uid,
      isSaving,
      modifiedModuleUids,
      modules,
      persistedLessonUids,
      queryClient,
    ],
  );

  const proceedSelectLesson = useCallback(
    (lessonId: string) => {
      setActiveLessonId(lessonId);
      const moduleForLesson = findModuleByLessonId(outlineModules, lessonId);
      if (moduleForLesson?.uid) setActiveModuleId(moduleForLesson.uid);
    },
    [outlineModules],
  );

  const proceedSelectModule = useCallback(
    (moduleId: string) => {
      setActiveModuleId(moduleId);
      const targetModule = modules.find((module) => module.uid === moduleId);
      const firstLessonId = targetModule
        ? getFirstEditableLessonId(targetModule)
        : null;
      setActiveLessonId(firstLessonId);
    },
    [modules],
  );

  const requestNavigation = useCallback(
    (navigation: PendingNavigation) => {
      const hasUnsavedChanges =
        activeLessonId &&
        (modifiedLessons.has(activeLessonId) ||
          modifiedAssignmentLessons.has(activeLessonId));

      if (
        hasUnsavedChanges &&
        !(
          navigation.type === "lesson" && navigation.lessonId === activeLessonId
        )
      ) {
        setPendingNavigation(navigation);
        setUnsavedDialogOpen(true);
        return false;
      }

      if (navigation.type === "lesson") {
        proceedSelectLesson(navigation.lessonId);
      } else {
        proceedSelectModule(navigation.moduleId);
      }
      return true;
    },
    [
      activeLessonId,
      modifiedLessons,
      modifiedAssignmentLessons,
      proceedSelectLesson,
      proceedSelectModule,
    ],
  );

  const handleSelectLesson = useCallback(
    (lessonId: string): boolean => {
      const targetModule = findModuleByLessonId(outlineModules, lessonId);
      const targetLesson = targetModule?.lessons?.find(
        (lesson) => lesson.uid === lessonId,
      );
      return requestNavigation({
        type: "lesson",
        lessonId,
        label: `pindah ke "${targetLesson?.title ?? "lesson lain"}"`,
      });
    },
    [outlineModules, requestNavigation],
  );

  const handleSelectModule = useCallback(
    (moduleId: string) => {
      if (moduleId === activeModuleId) return;
      const targetModule = outlineModules.find(
        (module) => module.uid === moduleId,
      );
      requestNavigation({
        type: "module",
        moduleId,
        label: `pindah ke "${targetModule?.title ?? "modul lain"}"`,
      });
    },
    [activeModuleId, outlineModules, requestNavigation],
  );

  const handleSaveCurrentLesson = useCallback(async () => {
    if (!activeLessonId || !activeLessonModified) return;
    await saveLesson(activeLessonId);
  }, [activeLessonId, activeLessonModified, saveLesson]);

  const handleSaveCurrentAssignment = useCallback(async () => {
    if (!activeLessonId || !activeLesson) return;

    const persistedLessonUid = activeLesson.uid ?? null;
    if (!persistedLessonUid) {
      toast.error("Simpan lesson terlebih dahulu sebelum menyimpan tugas.");
      return;
    }

    const homeworkLesson = ensureHomeworkDefaults(activeLesson);
    const validationError = validateHomeworkForSave(homeworkLesson);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const result = await saveAssignmentMutation.mutateAsync({
        lessonUid: persistedLessonUid,
        lesson: homeworkLesson,
      });

      setModules((previous) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const lessonKey = getLessonKey(lesson);
            if (lessonKey !== activeLessonId && lesson.id !== activeLessonId) {
              return lesson;
            }

            return {
              ...lesson,
              homeworkAssignmentUid: result.assignmentUid,
              hasHomework: Boolean(
                result.assignmentUid && isHomeworkConfigured(homeworkLesson),
              ),
            };
          }),
        })),
      );

      setModifiedAssignmentLessons((previous) => {
        const next = new Set(previous);
        next.delete(activeLessonId);
        return next;
      });

      lastHydratedAssignmentRef.current = activeLessonId;

      toast.success(
        result.assignmentUid
          ? "Tugas berhasil disimpan."
          : "Tugas dihapus dari server.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menyimpan tugas.",
      );
      throw error;
    }
  }, [activeLesson, activeLessonId, saveAssignmentMutation]);

  const handleDeleteCurrentAssignment = useCallback(async () => {
    if (!activeLessonId || !activeLesson) return;

    const persistedLessonUid = activeLesson.uid ?? null;
    const hasPersistedAssignment = Boolean(activeLesson.homeworkAssignmentUid);

    try {
      if (hasPersistedAssignment && persistedLessonUid) {
        await deleteAssignmentMutation.mutateAsync();
      }

      setModules((previous) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const lessonKey = getLessonKey(lesson);
            if (lessonKey !== activeLessonId && lesson.id !== activeLessonId) {
              return lesson;
            }
            return clearHomeworkFromLesson(lesson);
          }),
        })),
      );

      setModifiedAssignmentLessons((previous) => {
        const next = new Set(previous);
        next.delete(activeLessonId);
        return next;
      });

      lastHydratedAssignmentRef.current = null;

      toast.success("Tugas dihapus dari lesson ini.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus tugas.",
      );
      throw error;
    }
  }, [activeLesson, activeLessonId, deleteAssignmentMutation]);

  const handleSaveAndContinue = useCallback(async () => {
    if (!activeLessonId || !pendingNavigation) return;

    try {
      if (modifiedLessons.has(activeLessonId)) {
        await saveLesson(activeLessonId, { silent: true });
      }
      if (modifiedAssignmentLessons.has(activeLessonId)) {
        await handleSaveCurrentAssignment();
      }

      setUnsavedDialogOpen(false);

      if (pendingNavigation.type === "lesson") {
        proceedSelectLesson(pendingNavigation.lessonId);
      } else {
        proceedSelectModule(pendingNavigation.moduleId);
      }

      setPendingNavigation(null);
      toast.success("Perubahan disimpan. Melanjutkan navigasi.");
    } catch {
      // Error toast already shown in save handlers.
    }
  }, [
    activeLessonId,
    pendingNavigation,
    modifiedLessons,
    modifiedAssignmentLessons,
    proceedSelectLesson,
    proceedSelectModule,
    saveLesson,
    handleSaveCurrentAssignment,
  ]);

  const handleCreateModule = useCallback(
    async (title: string) => {
      if (isModuleMutating) return;

      const courseUid = courseData.uid;
      if (!courseUid) {
        toast.error("UID kursus tidak ditemukan.");
        return;
      }

      const replacesFallback = isOnlyUnpersistedFallbackModule(
        modules,
        persistedModuleUidsRef.current,
      );
      const orderIndex = replacesFallback ? 1 : outlineModules.length + 1;
      const moduleTitle = normalizeModuleTitle(title, `Modul ${orderIndex}`);

      setIsModuleMutating(true);
      try {
        const createdModule = await createPersistedModule({
          courseUid,
          title: moduleTitle,
          orderIndex,
        });

        persistedModuleUidsRef.current.add(createdModule.uid!);

        setModules((previous) =>
          replacesFallback ? [createdModule] : [...previous, createdModule],
        );
        setLoadedModuleIds(
          (previous) => new Set([...previous, createdModule.uid!]),
        );

        const firstLessonId = getFirstEditableLessonId(createdModule);
        if (firstLessonId) {
          setModifiedLessons(
            (previous) => new Set([...previous, firstLessonId]),
          );
        }

        await invalidateModuleQueries(courseUid, createdModule.uid);
        toast.success("Modul berhasil dibuat.");
        proceedSelectModule(createdModule.uid!);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal membuat modul.",
        );
        throw error;
      } finally {
        setIsModuleMutating(false);
      }
    },
    [
      courseData.uid,
      invalidateModuleQueries,
      isModuleMutating,
      modules,
      outlineModules.length,
      proceedSelectModule,
    ],
  );

  const handleRenameModule = useCallback(
    async (moduleId: string, title: string) => {
      const targetModule = modules.find((module) => module.uid === moduleId);
      if (!targetModule) return;

      const previousTitle = targetModule.title;
      const nextTitle = normalizeModuleTitle(title, previousTitle);

      applyOutlineUpdate((current) =>
        renameModule(current, moduleId, nextTitle),
      );

      if (!persistedModuleUidsRef.current.has(moduleId)) {
        setModifiedModuleUids((previous) => new Set([...previous, moduleId]));
        return;
      }

      if (nextTitle === previousTitle) return;

      setIsModuleMutating(true);
      try {
        await updatePersistedModule({
          moduleUid: moduleId,
          title: nextTitle,
          orderIndex: targetModule.order_index,
        });

        setModifiedModuleUids((previous) => {
          const next = new Set(previous);
          next.delete(moduleId);
          return next;
        });

        const courseUid = courseData.uid;
        if (courseUid) {
          await invalidateModuleQueries(courseUid, moduleId);
        }

        toast.success("Nama modul berhasil diperbarui.");
      } catch (error) {
        applyOutlineUpdate((current) =>
          renameModule(current, moduleId, previousTitle),
        );
        toast.error(
          error instanceof Error
            ? error.message
            : "Gagal memperbarui nama modul.",
        );
        throw error;
      } finally {
        setIsModuleMutating(false);
      }
    },
    [applyOutlineUpdate, courseData.uid, invalidateModuleQueries, modules],
  );

  const handleRequestDeleteModule = useCallback(
    (moduleId: string) => {
      if (moduleHasUnsavedLessons(moduleId)) {
        toast.error(
          "Simpan semua perubahan lesson di modul ini sebelum menghapus.",
        );
        return;
      }

      if (
        activeLessonId &&
        modifiedLessons.has(activeLessonId) &&
        findModuleForLesson(modules, activeLessonId)?.uid === moduleId
      ) {
        toast.error(
          "Simpan lesson yang sedang diedit sebelum menghapus modul.",
        );
        return;
      }

      setDeleteModuleId(moduleId);
    },
    [activeLessonId, moduleHasUnsavedLessons, modifiedLessons, modules],
  );

  const handleConfirmDeleteModule = useCallback(async () => {
    if (!deleteModuleId || isModuleMutating) return;

    const moduleId = deleteModuleId;
    const moduleToDelete = modules.find((module) => module.uid === moduleId);
    if (!moduleToDelete) {
      setDeleteModuleId(null);
      return;
    }

    setIsModuleMutating(true);
    try {
      const isPersisted = persistedModuleUidsRef.current.has(moduleId);

      if (isPersisted) {
        await deletePersistedModule(moduleId);
        persistedModuleUidsRef.current.delete(moduleId);
      }

      const nextOutline = removeModule(outlineModules, moduleId);
      handleModulesChange(nextOutline);

      const deletedLessonKeys = collectPersistedLessonKeys(
        moduleToDelete.lessons,
      );
      setPersistedLessonUids((previous) => {
        const next = new Set(previous);
        for (const lessonKey of deletedLessonKeys) {
          next.delete(lessonKey);
          initialLessonModuleMapRef.current.delete(lessonKey);
        }
        return next;
      });

      setModifiedLessons((previous) => {
        const next = new Set(previous);
        for (const lesson of moduleToDelete.lessons) {
          next.delete(getLessonKey(lesson));
        }
        return next;
      });

      setModifiedModuleUids((previous) => {
        const next = new Set(previous);
        next.delete(moduleId);
        return next;
      });

      setLoadedModuleIds((previous) => {
        const next = new Set(previous);
        next.delete(moduleId);
        return next;
      });

      const fallbackModule = nextOutline[0];
      if (activeModuleId === moduleId) {
        setActiveModuleId(fallbackModule?.uid ?? null);
        setActiveLessonId(
          fallbackModule ? getFirstLessonId(fallbackModule) : null,
        );
      }

      const courseUid = courseData.uid;
      if (courseUid) {
        await invalidateModuleQueries(courseUid, moduleId);
      }

      setDeleteModuleId(null);
      toast.success("Modul berhasil dihapus.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Gagal menghapus modul.",
      );
      throw error;
    } finally {
      setIsModuleMutating(false);
    }
  }, [
    activeModuleId,
    courseData.uid,
    deleteModuleId,
    handleModulesChange,
    invalidateModuleQueries,
    isModuleMutating,
    modules,
    outlineModules,
  ]);

  const handleAddLesson = useCallback(
    (moduleId?: string) => {
      const targetModuleId = moduleId ?? activeOutlineModule?.uid;
      if (!targetModuleId) return;

      const nextOutline = addLesson(outlineModules, targetModuleId);
      handleModulesChange(nextOutline);
      const updatedModule = nextOutline.find(
        (module) => module.uid === targetModuleId,
      );
      const lastLesson = updatedModule?.lessons?.at(-1);
      const lastLessonId = lastLesson?.uid ?? null;

      if (lastLessonId) {
        setModifiedLessons((previous) => new Set([...previous, lastLessonId]));
        requestNavigation({
          type: "lesson",
          lessonId: lastLessonId,
          label: `pindah ke "${lastLesson?.title ?? "lesson baru"}"`,
        });
      }
    },
    [
      activeOutlineModule,
      handleModulesChange,
      outlineModules,
      requestNavigation,
    ],
  );

  const handleRenameLesson = useCallback(
    async (lessonId: string, title: string) => {
      const trimmed = title.trim();
      if (!trimmed) return;

      const moduleForLesson = findModuleForLesson(modules, lessonId);
      if (!moduleForLesson?.uid) return;

      const currentLesson = findLesson(modules, lessonId);
      if (!currentLesson || trimmed === currentLesson.title) return;

      const previousTitle = currentLesson.title;

      setModules((previous) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const lessonKey = getLessonKey(lesson);
            if (lessonKey !== lessonId && lesson.id !== lessonId) return lesson;
            return { ...lesson, title: trimmed };
          }),
        })),
      );

      try {
        if (persistedLessonUids.has(lessonId)) {
          await updateLesson(lessonId, { title: trimmed });
          await Promise.all([
            invalidateModuleQueries(courseData.uid, moduleForLesson.uid),
            queryClient.invalidateQueries({
              queryKey: lessonKeys.detail(lessonId),
            }),
          ]);
          toast.success("Nama lesson diperbarui.");
          return;
        }

        await saveLesson(lessonId, {
          silent: true,
          lesson: { ...currentLesson, title: trimmed },
        });
        toast.success("Nama lesson diperbarui.");
      } catch (error) {
        setModules((previous) =>
          previous.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => {
              const lessonKey = getLessonKey(lesson);
              if (lessonKey !== lessonId && lesson.id !== lessonId) return lesson;
              return { ...lesson, title: previousTitle };
            }),
          })),
        );
        toast.error(
          error instanceof Error ? error.message : "Gagal memperbarui nama lesson.",
        );
        throw error;
      }
    },
    [
      courseData.uid,
      invalidateModuleQueries,
      modules,
      persistedLessonUids,
      queryClient,
      saveLesson,
    ],
  );

  const handleDeleteLesson = useCallback(
    async (lessonId: string) => {
      if (activeLessonId === lessonId && modifiedLessons.has(lessonId)) {
        toast.error(
          "Simpan atau batalkan perubahan lesson ini sebelum menghapus.",
        );
        return;
      }

      const moduleForLesson = findModuleByLessonId(outlineModules, lessonId);
      if (!moduleForLesson) return;

      const nextOutline = removeLesson(
        outlineModules,
        moduleForLesson.uid,
        lessonId,
      );
      handleModulesChange(nextOutline);

      if (persistedLessonUids.has(lessonId)) {
        try {
          await deleteLesson(lessonId);
          setPersistedLessonUids((previous) => {
            const next = new Set(previous);
            next.delete(lessonId);
            return next;
          });
          initialLessonModuleMapRef.current.delete(lessonId);
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Gagal menghapus lesson.",
          );
          return;
        }
      }

      setModifiedLessons((previous) => {
        const next = new Set(previous);
        next.delete(lessonId);
        return next;
      });

      if (activeLessonId === lessonId) {
        const updatedModule = nextOutline.find(
          (module) => module.uid === moduleForLesson.uid,
        );
        setActiveLessonId(
          updatedModule ? getFirstLessonId(updatedModule) : null,
        );
      }

      await queryClient.invalidateQueries({
        queryKey: lessonKeys.byModule(moduleForLesson.uid),
      });
    },
    [
      activeLessonId,
      handleModulesChange,
      modifiedLessons,
      outlineModules,
      persistedLessonUids,
      queryClient,
    ],
  );

  const handleChangeLessonType = useCallback(
    (lessonId: string, deliveryType: "text" | "video") => {
      setModules((previous) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => {
            const lessonKey = getLessonKey(lesson);
            if (lessonKey !== lessonId && lesson.id !== lessonId) return lesson;
            return switchLessonDeliveryType(lesson, deliveryType);
          }),
        })),
      );
      setModifiedLessons((previous) => new Set([...previous, lessonId]));
    },
    [],
  );

  const handlePublish = useCallback(async () => {
    try {
      if (activeLessonId && modifiedLessons.has(activeLessonId)) {
        await saveLesson(activeLessonId, { silent: true });
      }

      const updated = await updateCourseStatus.mutateAsync({
        courseUid: courseData.uid,
      });

      const statusPatch =
        typeof updated === "object" &&
        updated !== null &&
        "status" in updated &&
        typeof (updated as { status?: unknown }).status === "string"
          ? (updated as { status: string }).status
          : "ACTIVE";

      setCourse((previous) =>
        previous
          ? {
              ...previous,
              status: statusPatch,
              is_published: isCoursePublished({
                ...previous,
                status: statusPatch,
                is_published:
                  typeof updated === "object" &&
                  updated !== null &&
                  "is_published" in updated
                    ? Boolean((updated as { is_published?: boolean }).is_published)
                    : previous.is_published,
              }),
            }
          : previous,
      );
    } catch {
      // Error toast sudah ditangani di saveLesson atau useUpdateCourseStatus.
    }
  }, [
    activeLessonId,
    courseData.uid,
    modifiedLessons,
    saveLesson,
    updateCourseStatus,
  ]);

  const isAssignmentLoading = Boolean(
    shouldLoadAssignment && assignmentQuery.isLoading,
  );

  return {
    course,
    outlineModules,
    activeModuleId,
    activeLessonId,
    activeLesson,
    activeOutlineModule,
    editorReady,
    modifiedLessons,
    activeLessonModified,
    activeAssignmentModified,
    isSavingAssignment: saveAssignmentMutation.isPending,
    isDeletingAssignment: deleteAssignmentMutation.isPending,
    isSaving,
    isPublishing: updateCourseStatus.isPending,
    isCreateModuleOpen,
    renameModuleId,
    renameModuleTitle,
    deleteModuleId,
    deleteModuleTitle,
    isModuleMutating,
    loadedModuleIds,
    isModuleLessonsLoading,
    isLessonDetailLoading:
      lessonDetailQuery.isLoading && shouldLoadLessonDetail,
    isAssignmentLoading,
    unsavedDialogOpen,
    pendingNavigation,
    routeBasePath,
    courseUid: courseData.uid,
    setUnsavedDialogOpen,
    setIsCreateModuleOpen,
    setRenameModuleId,
    setDeleteModuleId,
    handleSelectModule,
    handleSelectLesson,
    handleCreateModule,
    handleRenameModule,
    handleRequestDeleteModule,
    handleConfirmDeleteModule,
    handleAddLesson,
    handleRenameLesson,
    handleDeleteLesson,
    handleChangeLessonType,
    handlePublish,
    handleSaveCurrentLesson,
    handleSaveCurrentAssignment,
    handleDeleteCurrentAssignment,
    handleSaveAndContinue,
    patchLocalLesson,
    patchAssignmentLesson,
  };
}
