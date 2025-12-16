export interface GPXPoint {
    lat: number;
    lon: number;
    ele: number;
  }
  
  export interface ProfilePoint {
    x: number; // distance cumulée (m)
    y: number; // altitude (m)
  }
  
  export interface ProfilePOI {
    x: number;
    y: number;
    label: string;
    type: "refuge" | "col" | "danger" | "water";
  }
  
  export interface ProfileData {
    points: ProfilePoint[];
    pois: ProfilePOI[];
    bounds: {
      minAlt: number;
      maxAlt: number;
      totalDist: number;
    };
  }
  