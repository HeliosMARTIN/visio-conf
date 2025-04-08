export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  picture: string;
  desc?: string;
  status?: string;
  date_create?: string | Date;
  last_connection?: string | Date;
  roles?: string[] | any[];
}
