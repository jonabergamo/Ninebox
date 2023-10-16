import { User } from ".";
import { Class } from ".";

export type Teacher = {
  user: User;
  classes: Class[];
  subjects: number[];
};
