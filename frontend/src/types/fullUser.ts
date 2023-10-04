import { Class } from "./class";
import { User } from "./user";

export type FullUser = {
  classes: Class[];
  info: User;
  nine_boxes?: any[];
  subjects?: number[];
};

export default FullUser;
