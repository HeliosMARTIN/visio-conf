export interface User {
  _id?: string;
  id?: string;
  userId?: string;
  uuid: string;
  firstname?: string;
  lastname?: string;
  email: string;
  picture?: string;
  socket_id?: string;
  phone: string;
  desc?: string;
  status?: string;
  date_create?: string | Date;
  last_connection?: string | Date;
  roles?: string[] | any[];
}
