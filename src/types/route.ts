export interface Route {
  id: string
  place_id: string
  external_id: string | null
  name: string
  grade: GradeInfo | null
  type: ClimbDiscipline[]
  length: number | null
  description: string | null
  protection: string | null
  fa: string | null
  source: "openbeta" | "user"
  created_at: string
  updated_at: string
}

export interface GradeInfo {
  yds?: string
  vscale?: string
  font?: string
  french?: string
  ewbank?: string
  uiaa?: string
}

export type ClimbDiscipline =
  | "sport"
  | "trad"
  | "bouldering"
  | "tr"
  | "ice"
  | "alpine"
  | "aid"
  | "mixed"
  | "deepwatersolo"
  | "snow"
