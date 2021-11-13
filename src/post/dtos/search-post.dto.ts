export enum SortedByEnum {
    createdAt = "createdAt",
    mostVisited = "mostVisited",
    mostPopular = "mostPopular"
}

export class SearchPostDto {
    search: string;
    fields: string[];
    sortBy: SortedByEnum;
    page: number;
}