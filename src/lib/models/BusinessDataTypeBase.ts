export abstract class BusinessDataTypeBase {
    static getDataContextKey(): string { return ''; }
    static primaryKeyWhereCondition(element: BusinessDataTypeBase, primaryKey: any): boolean { return false; }
    static extraDeleteSteps(element: BusinessDataTypeBase): void { }
}