export interface SectionFilterDto {
    from: Date;
    to: Date;
    trainType?: string;
    trainLine?: string;
    delaysOnly: boolean;
}
