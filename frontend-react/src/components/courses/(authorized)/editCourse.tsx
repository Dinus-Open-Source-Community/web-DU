import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CourseDetailLesson,
  ICourseDetailItem,
  ICourseDetailModule,
  ILesson,
  IQuiz,
  LessonDetailItem,
  LessonPayloadInput,
} from "../../../lib/types/course";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../ui/button";
import { ROUTES } from "../../../lib/routes";
import { PageHeader } from "../../shared/Header";
import { Checkbox } from "../../ui/checkbox";
import { ConfirmDialog } from "../../shared/ConfirmDialog";
import { TiptapEditor } from "../../shared/TipTapEditor";
import { LessonVideoEditor } from "../../shared/LessonVideoEditor";
import { CourseAssignmentDialog } from "../../shared/CourseAssignmentDialog";
import { CourseModuleOutline } from "../../shared/CourseModuleOutline";
import {
  parseLessonContent,
  toCourseDetailLesson,
} from "../../../lib/rich-text";
import type { RichTextContentFormat } from "../../../lib/types/rich-text";
import { validateLessonPayloadInputs } from "../../../lib/validator/lessons";
import { courseKeys, lessonKeys, moduleKeys } from "@/hooks/query-keys";
import { useLessonByUid } from "@/hooks/use-lessons";
import { createLesson, deleteLesson, updateLesson } from "@/services/lessons";
import { createModule, deleteModule, updateModule } from "@/services/module";

type CourseEditClientProps = {
  initialModuleId?: string;
  routeBasePath?: "/mentor" | "/admin";
  role?: "mentor" | "admin";
  courseData: ICourseDetailItem;
  /** Modul tanpa lesson nested — lesson di-fetch via `/lessons?module_uid=`. */
  modules: ICourseDetailModule[];
  /** Ringkasan lesson per modul dari GET `/lessons`. */
  lessonsByModule: Record<string, LessonDetailItem[]>;
};

type LessonApiItem = LessonDetailItem;
type EditableLesson = ILesson & { uid?: string };
type EditableModule = Omit<ICourseDetailModule, "lessons"> & {
  uid?: string;
  lessons: EditableLesson[];
};

function createLocalId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function findLesson(
  modules: EditableModule[],
  lessonId: string,
): EditableLesson | null {
  for (const courseModule of modules) {
    const lesson = courseModule.lessons.find(
      (item: EditableLesson) => item.id === lessonId || item.uid === lessonId,
    );
    if (lesson) return lesson;
  }
  return null;
}

function toMentorCourse(course: ICourseDetailItem): Partial<ICourseDetailItem> {
  const category = course.category as { name?: unknown } | undefined;
  const courseType = course.course_type as { name?: unknown } | undefined;

  return {
    uid: (course.uid as string) ?? "",
    title: (course.title as string) ?? "",
    subtitle: (course.subtitle as string) ?? "",
    description: (course.description as string) ?? "",
    cover_url:
      (course.cover_url as string) ?? (course.thumbnail_url as string) ?? "",
    is_published: Boolean(course.is_published),
    updated_at: (course.updated_at as string) ?? "",
    category:
      typeof category?.name === "string"
        ? (category as ICourseDetailItem["category"])
        : undefined,
    level: (course.level as ICourseDetailItem["level"]) ?? undefined,
    course_type:
      typeof courseType?.name === "string"
        ? (courseType as ICourseDetailItem["course_type"])
        : undefined,
    price: typeof course.price === "number" ? course.price : undefined,
    price_strike:
      typeof course.price_strike === "number" ? course.price_strike : undefined,
    what_you_learn: Array.isArray(course.what_you_learn)
      ? (course.what_you_learn as unknown[]).filter(
          (item): item is string => typeof item === "string",
        )
      : undefined,
  };
}

function createDefaultQuiz(): IQuiz {
  return { questions: [], passingScore: 70 };
}

function createFallbackLesson(order = 1): EditableLesson {
  return {
    id: createLocalId("lesson"),
    title: `Lesson ${order}`,
    order,
    durationMinutes: 10,
    hasHomework: false,
    homeworkType: "text",
    homeworkDescriptionHtml: "<p></p>",
    homeworkQuiz: createDefaultQuiz(),
    contentType: "text",
    contentHtml: "",
    contentFormat: "tiptap",
  };
}

function createFallbackModule(order_index = 1): EditableModule {
  return {
    uid: createLocalId("module"),
    course_uid: "",
    created_at: "",
    order_index,
    title: `Modul ${order_index}`,
    lessons: [createFallbackLesson(1)],
  };
}

function toLesson(item: LessonApiItem, fallbackOrder: number): EditableLesson {
  const parsedContent = parseLessonContent(item.content);
  const lessonContentType =
    item.content_type === "video" || Boolean(item.video_url) ? "video" : "text";

  const assignment = item.assignment ?? null;
  const taskDescription = assignment?.task_description;
  const homeworkDescriptionHtml =
    typeof taskDescription?.contentHtml === "string"
      ? taskDescription.contentHtml
      : "<p></p>";

  const base = {
    id: item.uid ?? `lesson-${fallbackOrder}`,
    uid: item.uid,
    title: item.title ?? `Lesson ${fallbackOrder}`,
    order: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    durationMinutes: 10,
    hasHomework: Boolean(assignment),
    homeworkType: assignment?.task_type ?? ("text" as const),
    homeworkDescriptionHtml,
    homeworkQuiz: assignment?.quiz_payload ?? createDefaultQuiz(),
  };

  const contentHtml = parsedContent.contentHtml;
  const contentFormat: RichTextContentFormat = parsedContent.contentFormat;

  if (lessonContentType === "video") {
    return {
      ...base,
      contentType: "video",
      videoUrl: item.video_url ?? "",
      contentHtml,
      contentFormat,
    };
  }

  return {
    ...base,
    contentType: "text",
    contentHtml,
    contentFormat,
  };
}

function getLessonKey(lesson: { uid?: string; id: string }) {
  return lesson.uid ?? lesson.id;
}

function editableLessonToPayloadInput(
  lesson: EditableLesson,
  moduleUid: string,
): LessonPayloadInput {
  const deliveryType = lesson.contentType === "video" ? "video" : "text";

  return {
    module_uid: moduleUid,
    title: lesson.title.trim(),
    order_index: lesson.order,
    deliveryType,
    contentHtml:
      deliveryType === "text" && lesson.contentType === "text"
        ? lesson.contentHtml
        : undefined,
    contentFormat: lesson.contentFormat ?? "tiptap",
    videoUrl:
      deliveryType === "video" && lesson.contentType === "video"
        ? lesson.videoUrl
        : undefined,
  };
}

function buildEditableLessonFromOutline(
  outlineLesson: CourseDetailLesson,
  lessonIndex: number,
  prevLesson?: EditableLesson,
): EditableLesson {
  const deliveryType =
    outlineLesson.content_type === "video" ? "video" : "text";
  const shared = {
    id: prevLesson?.id ?? outlineLesson.uid,
    uid: outlineLesson.uid,
    title: outlineLesson.title,
    order: outlineLesson.order_index ?? lessonIndex + 1,
    durationMinutes: prevLesson?.durationMinutes ?? 10,
    hasHomework: prevLesson?.hasHomework ?? false,
    homeworkType: prevLesson?.homeworkType ?? ("text" as const),
    homeworkDescriptionHtml: prevLesson?.homeworkDescriptionHtml ?? "<p></p>",
    homeworkQuiz: prevLesson?.homeworkQuiz ?? createDefaultQuiz(),
    contentFormat: prevLesson?.contentFormat ?? ("tiptap" as const),
  };

  if (deliveryType === "video") {
    return {
      ...shared,
      contentType: "video",
      videoUrl:
        prevLesson?.contentType === "video"
          ? prevLesson.videoUrl
          : (outlineLesson.video_url ?? ""),
      contentHtml: prevLesson?.contentHtml,
    };
  }

  return {
    ...shared,
    contentType: "text",
    contentHtml:
      prevLesson?.contentType === "text" ? prevLesson.contentHtml : "",
  };
}

function mergeOutlineModules(
  previous: EditableModule[],
  outline: ICourseDetailModule[],
): EditableModule[] {
  const previousLessonMap = new Map<string, EditableLesson>();
  const previousModuleMap = new Map<string, EditableModule>();

  for (const mod of previous) {
    if (mod.uid) previousModuleMap.set(mod.uid, mod);
    for (const lesson of mod.lessons) {
      previousLessonMap.set(getLessonKey(lesson), lesson);
    }
  }

  return outline.map((outlineModule, moduleIndex) => {
    const prevModule = previousModuleMap.get(outlineModule.uid);

    return {
      uid: outlineModule.uid,
      course_uid: outlineModule.course_uid || prevModule?.course_uid || "",
      title: outlineModule.title,
      order_index: outlineModule.order_index ?? moduleIndex + 1,
      created_at: outlineModule.created_at ?? prevModule?.created_at ?? "",
      updated_at: outlineModule.updated_at ?? prevModule?.updated_at,
      lessons: (outlineModule.lessons ?? []).map((outlineLesson, lessonIndex) =>
        buildEditableLessonFromOutline(
          outlineLesson,
          lessonIndex + 1,
          previousLessonMap.get(outlineLesson.uid),
        ),
      ),
    };
  });
}

function toModule(
  item: ICourseDetailModule,
  lessons: EditableLesson[],
  fallbackOrder: number,
): EditableModule {
  return {
    uid: item.uid,
    course_uid: (item.course_uid as string) ?? "",
    title: (item.title as string) ?? `Modul ${fallbackOrder}`,
    order_index: Number(item.order_index ?? fallbackOrder) || fallbackOrder,
    created_at: (item.created_at as string) ?? "",
    lessons: lessons.length > 0 ? lessons : [createFallbackLesson(1)],
  };
}

export function CourseEditClient({
  initialModuleId,
  routeBasePath = "/mentor",
  role = "mentor",
  courseData,
  modules: sourceModules,
  lessonsByModule,
}: CourseEditClientProps) {
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [course, setCourse] = useState<Partial<ICourseDetailItem> | null>(null);
  const [modules, setModules] = useState<EditableModule[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [editorReady, setEditorReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modifiedLessons, setModifiedLessons] = useState<Set<string>>(
    new Set(),
  );
  const [isConfirm, setIsConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const persistedModuleUidsRef = useRef<Set<string>>(new Set());
  const [persistedLessonUids, setPersistedLessonUids] = useState<Set<string>>(
    () => new Set(),
  );
  const initialLessonModuleMapRef = useRef<Map<string, string>>(new Map());
  const lastHydratedLessonRef = useRef<string | null>(null);

  const fetchedModules = useMemo(() => {
    if (!sourceModules || sourceModules.length === 0) return [];
    return sourceModules.map((module, index) => {
      const lessonItems: LessonApiItem[] = (
        lessonsByModule[module.uid] ?? []
      ).map((lesson) => ({
        ...lesson,
        is_reading: "is_reading" in lesson ? Boolean(lesson.is_reading) : false,
      }));
      const lessons =
        lessonItems.length > 0
          ? lessonItems.map((item: LessonApiItem, lessonIndex: number) =>
              toLesson(item, lessonIndex + 1),
            )
          : [createFallbackLesson(1)];
      return toModule(module, lessons, index + 1);
    });
  }, [sourceModules, lessonsByModule]);

  const hasCourseModules = sourceModules.length > 0;

  const shouldLoadLessonDetail = Boolean(
    activeLessonId &&
    persistedLessonUids.has(activeLessonId) &&
    !modifiedLessons.has(activeLessonId),
  );

  const lessonDetailQuery = useLessonByUid(
    shouldLoadLessonDetail ? activeLessonId! : "",
  );

  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    return findLesson(modules, activeLessonId);
  }, [modules, activeLessonId]);

  const outlineModules = useMemo<ICourseDetailModule[]>(() => {
    return modules.map((module) => ({
      uid: module.uid ?? "",
      course_uid: module.course_uid,
      title: module.title,
      order_index: module.order_index,
      created_at: module.created_at,
      updated_at: module.updated_at,
      lessons: module.lessons.map(
        (lesson, index): CourseDetailLesson =>
          toCourseDetailLesson(lesson, module.uid ?? "", index),
      ),
    }));
  }, [modules]);

  // Initialize course data from API response
  useEffect(() => {
    if (courseData && typeof courseData === "object") {
      setCourse(toMentorCourse(courseData as ICourseDetailItem));
      return;
    }
    setCourse(null);
  }, [courseData]);

  useEffect(() => {
    if (!shouldLoadLessonDetail || !lessonDetailQuery.data || !activeLessonId) {
      return;
    }
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
          return {
            ...hydrated,
            id: lesson.id,
            uid: lesson.uid ?? lessonApiItem.uid,
          };
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
  }, [activeLessonId]);

  // Initialize modules only once when data is loaded
  useEffect(() => {
    if (isInitialized || !courseData || typeof courseData !== "object") return;

    if (!hasCourseModules) {
      const fallbackModule = createFallbackModule(1);
      setModules([fallbackModule]);

      const fallbackLessonId = fallbackModule.lessons[0]?.id ?? null;
      setActiveLessonId(fallbackLessonId);
      setEditorReady(true);
      setIsInitialized(true);
      return;
    }

    const nextModules =
      fetchedModules.length > 0 ? fetchedModules : [createFallbackModule(1)];
    setModules(nextModules);

    const firstLessonId = (() => {
      if (initialModuleId) {
        const targetModule = nextModules.find(
          (module) => module.uid === initialModuleId,
        );
        if (targetModule?.lessons[0]) return targetModule.lessons[0].id;
      }
      return nextModules[0]?.lessons[0]?.id ?? null;
    })();

    setActiveLessonId(firstLessonId);
    setEditorReady(true);
    setIsInitialized(true);

    if (hasCourseModules) {
      const moduleUids = new Set<string>();
      const lessonUids = new Set<string>();
      const lessonModuleMap = new Map<string, string>();

      for (const mod of nextModules) {
        if (mod.uid) moduleUids.add(mod.uid);
        for (const lesson of mod.lessons) {
          const lessonUid = lesson.uid ?? lesson.id;
          lessonUids.add(lessonUid);
          if (mod.uid) lessonModuleMap.set(lessonUid, mod.uid);
        }
      }

      persistedModuleUidsRef.current = moduleUids;
      setPersistedLessonUids(lessonUids);
      initialLessonModuleMapRef.current = lessonModuleMap;
    } else {
      persistedModuleUidsRef.current = new Set();
      setPersistedLessonUids(new Set());
      initialLessonModuleMapRef.current = new Map();
    }
  }, [
    isInitialized,
    fetchedModules,
    initialModuleId,
    courseData,
    hasCourseModules,
  ]);

  const patchLocalLesson = useCallback(
    (lessonId: string, updater: (lesson: EditableLesson) => EditableLesson) => {
      setModules((previous: EditableModule[]) =>
        previous.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson: EditableLesson) => {
            if (lesson.id === lessonId) {
              setModifiedLessons((prev) => new Set([...prev, lessonId]));
              return updater(lesson);
            }
            return lesson;
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

  const handleSave = useCallback(
    async (opts?: { silent?: boolean; redirect?: boolean }) => {
      if (isSaving) return;

      setIsSaving(true);
      try {
        const courseUid = courseData.uid;
        if (!courseUid) {
          throw new Error("UID kursus tidak ditemukan.");
        }

        const workingModules = modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({ ...lesson })),
        }));

        const currentModuleUids = new Set(
          workingModules
            .map((mod) => mod.uid)
            .filter((uid): uid is string => Boolean(uid)),
        );
        const currentLessonUids = new Set(
          workingModules.flatMap((mod) =>
            mod.lessons.map((lesson) => lesson.uid ?? lesson.id),
          ),
        );

        const lessonPayloadInputs = workingModules.flatMap((mod) => {
          if (!mod.uid) return [];
          return mod.lessons.map((lesson) =>
            editableLessonToPayloadInput(lesson, mod.uid!),
          );
        });

        validateLessonPayloadInputs(lessonPayloadInputs);

        const nextPersistedLessonUids = new Set(persistedLessonUids);

        const removedModuleUids = [...persistedModuleUidsRef.current].filter(
          (uid) => !currentModuleUids.has(uid),
        );
        const removedLessonUids = [...nextPersistedLessonUids].filter(
          (uid) =>
            !currentLessonUids.has(uid) &&
            !removedModuleUids.includes(
              initialLessonModuleMapRef.current.get(uid) ?? "",
            ),
        );

        for (const lessonUid of removedLessonUids) {
          await deleteLesson(lessonUid);
          nextPersistedLessonUids.delete(lessonUid);
          initialLessonModuleMapRef.current.delete(lessonUid);
        }

        for (const moduleUid of removedModuleUids) {
          await deleteModule(moduleUid);
          persistedModuleUidsRef.current.delete(moduleUid);
        }

        const lessonUidMap = new Map<string, string>();

        for (const courseModule of workingModules) {
          let moduleUid = courseModule.uid;

          if (moduleUid && persistedModuleUidsRef.current.has(moduleUid)) {
            await updateModule(moduleUid, {
              title: courseModule.title.trim(),
              order_index: courseModule.order_index,
            });
          } else {
            const createdModule = await createModule({
              course_uid: courseUid,
              title: courseModule.title.trim(),
              order_index: courseModule.order_index,
            });

            if (!createdModule.uid) {
              throw new Error(
                "Backend tidak mengembalikan uid untuk modul baru.",
              );
            }

            moduleUid = createdModule.uid;
            courseModule.uid = createdModule.uid;
            courseModule.course_uid = createdModule.course_uid;
            persistedModuleUidsRef.current.add(createdModule.uid);
          }

          for (const lesson of courseModule.lessons) {
            const lessonUid = lesson.uid ?? lesson.id;
            const payload = editableLessonToPayloadInput(lesson, moduleUid);

            if (nextPersistedLessonUids.has(lessonUid)) {
              const savedLesson = await updateLesson(lessonUid, payload);
              lesson.uid = savedLesson.uid;
              lesson.id = savedLesson.uid;
            } else {
              const savedLesson = await createLesson(payload);
              if (lessonUid !== savedLesson.uid) {
                lessonUidMap.set(lessonUid, savedLesson.uid);
              }
              lesson.uid = savedLesson.uid;
              lesson.id = savedLesson.uid;
              nextPersistedLessonUids.add(savedLesson.uid);
              initialLessonModuleMapRef.current.set(savedLesson.uid, moduleUid);
            }
          }
        }

        if (activeLessonId) {
          const remappedActiveLessonId = lessonUidMap.get(activeLessonId);
          if (remappedActiveLessonId) {
            setActiveLessonId(remappedActiveLessonId);
          }
        }

        setModules(workingModules);
        setModifiedLessons(new Set());
        setPersistedLessonUids(nextPersistedLessonUids);

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: lessonKeys.all }),
          queryClient.invalidateQueries({ queryKey: moduleKeys.all }),
          queryClient.invalidateQueries({
            queryKey: courseKeys.detail(courseUid),
          }),
        ]);

        if (!opts?.silent) toast.success("Perubahan berhasil disimpan.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal menyimpan perubahan.",
        );
        throw error;
      } finally {
        setIsSaving(false);
      }
    },
    [modules, courseData.uid, isSaving, activeLessonId, queryClient, persistedLessonUids],
  );

  const handlePublish = useCallback(async () => {
    try {
      await handleSave({ silent: true, redirect: false });
      // await publishCourse.mutateAsync()
      setCourse((previous: Partial<ICourseDetailItem> | null) =>
        previous ? { ...previous, is_published: true } : previous,
      );
      toast.success("Kursus berhasil dipublikasikan.");
      navigate(`${routeBasePath}/courses/${courseData.uid}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Gagal mempublikasikan kursus.",
      );
    }
  }, [handleSave, courseData.uid, routeBasePath, navigate]);

  const handlePublishClick = async () => {
    await handlePublish();
  };

  if (!course) {
    return (
      <section className="flex flex-col gap-4 py-10">
        <p className="text-slate-600">
          Kursus tidak ditemukan. Akses editor hanya dari daftar kursus atau
          setelah membuat kursus baru.
        </p>
        <Button asChild variant="outline" className="w-fit rounded-xl">
          <Link to={ROUTES.courses}>Kembali ke daftar</Link>
        </Button>
      </section>
    );
  }

  return (
    <section className="flex w-full flex-col gap-6">
      <ConfirmDialog
        open={isConfirm}
        onOpenChange={setIsConfirm}
        title="Simpan perubahan kurikulum?"
        description="Semua modul dan lesson akan divalidasi lalu disinkronkan ke backend. Lesson video membutuhkan URL YouTube yang valid; lesson teks membutuhkan konten yang tidak kosong."
        confirmLabel={isSaving ? "Menyimpan..." : "Simpan"}
        onConfirm={() => {
          setIsConfirm(false);
          void handleSave();
        }}
      />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PageHeader title={course.title ?? ""} subtitle={course.subtitle} />
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
              course.is_published
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {course.is_published ? "Aktif" : "Belum dipublikasikan"}
          </span>
          {!course.is_published && isAdmin && (
            <Button
              type="button"
              className="rounded-xl"
              onClick={() => void handlePublishClick()}
            >
              Publish
            </Button>
          )}
        </div>
      </div>

      {course.cover_url && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
          <img
            src={course.cover_url}
            width={384}
            height={256}
            loading="lazy"
            alt={course.title}
            className="max-h-56 w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5">
          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Konten lesson
            </h2>
            {activeLesson && (
              <p className="text-sm font-medium text-slate-700">
                Sedang mengedit:{" "}
                <span className="text-slate-900">{activeLesson.title}</span>
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 uppercase">
                  {activeLesson.contentType}
                </span>
                {activeLesson.contentFormat && (
                  <span className="ml-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 uppercase">
                    {activeLesson.contentFormat}
                  </span>
                )}
              </p>
            )}
          </div>

          {lessonDetailQuery.isLoading && shouldLoadLessonDetail && (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Memuat konten lesson dari server...
            </p>
          )}

          {editorReady &&
            activeLesson &&
            !(lessonDetailQuery.isLoading && shouldLoadLessonDetail) && (
              <>
                {activeLesson.contentType === "text" && (
                  <>
                    {activeLesson.contentFormat === "html" && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Konten ini berasal dari HTML mentah backend. Setelah
                        diedit di editor WYSIWYG, format akan disimpan sebagai{" "}
                        <strong>tiptap</strong>.
                      </p>
                    )}
                    <TiptapEditor
                      key={activeLesson.id}
                      initialContent={activeLesson.contentHtml || "<p></p>"}
                      onChange={(html: string) => {
                        patchLocalLesson(
                          activeLesson.id,
                          (lesson: EditableLesson) => {
                            if (lesson.contentType !== "text") return lesson;
                            return {
                              ...lesson,
                              contentHtml: html,
                              contentFormat: "tiptap",
                            };
                          },
                        );
                      }}
                    />
                  </>
                )}

                {activeLesson.contentType === "video" && (
                  <LessonVideoEditor
                    key={activeLesson.id}
                    videoUrl={activeLesson.videoUrl}
                    description={activeLesson.contentHtml ?? ""}
                    onVideoUrlChange={(url: string) => {
                      patchLocalLesson(
                        activeLesson.id,
                        (lesson: EditableLesson) => {
                          if (lesson.contentType !== "video") return lesson;
                          return { ...lesson, videoUrl: url };
                        },
                      );
                    }}
                    onDescriptionChange={(html: string) => {
                      patchLocalLesson(
                        activeLesson.id,
                        (lesson: EditableLesson) => {
                          if (lesson.contentType !== "video") return lesson;
                          return {
                            ...lesson,
                            contentHtml: html,
                            contentFormat: "tiptap",
                          };
                        },
                      );
                    }}
                  />
                )}
              </>
            )}

          {activeLesson && (
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`lesson-homework-${activeLesson.id}`}
                  className="mt-0.5 size-4 border-slate-300"
                  checked={Boolean(activeLesson.hasHomework)}
                  onCheckedChange={(checked: boolean | "indeterminate") => {
                    const enabled = checked === true;
                    patchLocalLesson(
                      activeLesson.id,
                      (lesson: EditableLesson) => {
                        if (enabled) {
                          return {
                            ...lesson,
                            hasHomework: true,
                            homeworkType: lesson.homeworkType ?? "text",
                            homeworkDescriptionHtml:
                              lesson.homeworkDescriptionHtml ?? "<p></p>",
                            homeworkQuiz:
                              lesson.homeworkQuiz ?? createDefaultQuiz(),
                          };
                        }

                        return {
                          ...lesson,
                          hasHomework: false,
                        };
                      },
                    );
                  }}
                />
                <div>
                  <label
                    htmlFor={`lesson-homework-${activeLesson.id}`}
                    className="cursor-pointer text-sm font-semibold text-slate-700"
                  >
                    Aktifkan tugas untuk lesson ini
                  </label>
                  <p className="mt-1 text-xs text-slate-500">
                    Saat aktif, pilih tipe tugas lalu isi kontennya sebelum
                    membuat assignment lesson.
                  </p>
                </div>
              </div>

              {activeLesson.hasHomework && (
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <CourseAssignmentDialog
                    open={Boolean(activeLesson.hasHomework)}
                    onOpenChange={() => undefined}
                    variant="inline"
                    course={course as ICourseDetailItem}
                    courseUid={courseData.uid}
                    mode="create"
                    editing={null}
                    onSaved={() => undefined}
                    defaultMeetingNumber={activeLesson.order}
                    defaultTitle={`Tugas: ${activeLesson.title}`}
                    defaultTaskType={activeLesson.homeworkType ?? "text"}
                    defaultTaskDescription={
                      activeLesson.homeworkDescriptionHtml ?? "<p></p>"
                    }
                    defaultTaskQuiz={activeLesson.homeworkQuiz}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {modifiedLessons.size > 0
                ? `${modifiedLessons.size} lesson memiliki perubahan yang belum disimpan.`
                : "Perubahan modul/lesson akan disimpan ke backend saat Anda menekan simpan."}
            </p>
            <Button
              type="button"
              className="rounded-xl px-5"
              disabled={isSaving}
              onClick={() => setIsConfirm(true)}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>

        <CourseModuleOutline
          modules={outlineModules}
          activeLessonId={activeLessonId}
          onSelectLesson={setActiveLessonId}
          onModulesChange={handleModulesChange}
        />
      </div>
    </section>
  );
}
