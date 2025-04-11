import { User } from "./User";

export interface Call {
  id: string;
  call_type: "incoming" | "outgoing" | "missed";
  call_duration: number;
  call_date: string;
  participants: User[];
}
