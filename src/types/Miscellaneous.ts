export interface Position2D {
  x: number;
  y: number;
}

export interface Frame {
  face_mesh: Array<number[]>;
  body_pose: Array<number[]>;
  left_hand_pose: Array<number[]>;
  left_hand_sign: any[];
  right_hand_pose: Array<number[]>;
  right_hand_sign: any[];
  eyes: any[];
}
