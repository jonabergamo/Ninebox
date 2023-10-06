import { Criteria, Nine_box, Subject } from ".";

export type Activity = {
  id: number;
  subjects: Subject[];
  nine_boxes: Nine_box[];
  criteria: Criteria[];
  name: string;
  level: number;
  description: string;
  class_obj: string;
  average_grade: number;
  median_grade: number;
  percentile_25: number;
  percentile_75: number;
  std_dev_grade: number;
  total_students_with_activity: number;
  total_corrected_activities: number;
  created_at: string;
};
