import { Activity, Evaluation, User } from ".";
import { Student } from "./student";

export type StudentActivity = {
  id: number;
  activity: Activity;
  class_obj: string;
  evaluations: Evaluation[]; // Você deve especificar a tipagem correta para as avaliações se você tiver uma definição
  post_date: string; // Você pode querer usar Date, mas você precisaria converter a string para um objeto Date no seu código
  correction_date: string | null;
  final_grade: number | null;
  student: User;
  activity_link: string;
};
