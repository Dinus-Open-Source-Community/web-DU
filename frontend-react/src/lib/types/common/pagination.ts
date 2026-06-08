/** Metadata paginasi dari response list API. */
export interface IPaginationMeta {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

/** Response list API dengan meta paginasi. */
export type IPaginatedListResponse<TItem, TCollectionKey extends string> = {
  meta: IPaginationMeta
} & Record<TCollectionKey, TItem[]>
