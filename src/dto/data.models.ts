export type UpdateDataModel = {
  name: string;
  custom_fields_values: {
    field_name: string;
    field_code: string;
    field_type: string;
    values: { value: string }[];
  }[];
};

export type CreateDataModel = {
  name: string;
  custom_fields_values: {
    field_name: string;
    field_code: string;
    field_type: string;
    values: { value: string }[];
  }[];
}[];

export type CreateDealDataModel = {
  name: string;
  _embedded: { contacts: { id: number }[] };
}[];
