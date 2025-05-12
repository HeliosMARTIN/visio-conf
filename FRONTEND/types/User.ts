export interface User {
 _id: string
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  picture: string;
  socket_id?: string;
  phone: string;
  desc: string;
  date_create: string;
  roles: string[];
  last_connection: string;
}
