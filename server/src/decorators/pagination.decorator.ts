import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const DEFAULT_PAGE = 1,
  DEFAULT_ITEMS_PER_PAGE = 50;

export const Pagination = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return {
      page: getPageFromQuery(request.query),
      items_per_page: getItemsPerPageFromQuery(request.query),
    };
  },
);

function getPageFromQuery(query: any): number {
  const queryPage = Number(query.page);

  let page = isNaN(queryPage) ? DEFAULT_PAGE : queryPage;

  if (page < 1) {
    page = DEFAULT_PAGE;
  }

  return page;
}

function getItemsPerPageFromQuery(query: any): number {
  const queryItemsPerPage = Number(query.items_per_page);

  let items_per_page = isNaN(queryItemsPerPage)
    ? DEFAULT_ITEMS_PER_PAGE
    : queryItemsPerPage;

  if (items_per_page < 1) {
    items_per_page = DEFAULT_ITEMS_PER_PAGE;
  }

  if (items_per_page > 2 * DEFAULT_ITEMS_PER_PAGE) {
    items_per_page = 2 * DEFAULT_ITEMS_PER_PAGE;
  }

  return items_per_page;
}

export function calculatePagination(
  total_items: number,
  page: number,
  items_per_page: number,
) {
  return {
    page,
    items_per_page,
    total_items,
    total_pages: Math.ceil(total_items / items_per_page),
  };
}

export type PaginationType = {
  page: number;
  items_per_page: number;
};
