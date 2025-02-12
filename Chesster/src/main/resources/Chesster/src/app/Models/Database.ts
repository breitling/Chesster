import { DataSource } from "./DataSource";

export interface Database {
    id : string;
    ds : DataSource;
    notes : string;
}