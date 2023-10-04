import { Subject } from "./subject";
import Nine_box from "./nine_box";

export type Class = {
  unique_id?: string;
  name?: string;
  students?: any[]; // Substitua "any" pelo tipo exato se você tiver a estrutura dos estudantes
  teachers?: number[];
  activities?: any[]; // Substitua "any" pelo tipo exato se você tiver a estrutura das atividades
  nineboxes?: Nine_box[] | null; // Substitua "any" pelo tipo exato se você tiver a estrutura dos nineboxes
  subjects?: Subject[];
};

export default Class;
