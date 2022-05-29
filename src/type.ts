import { useEffect, useState, useDebugValue, useRef } from "react";

export type React = {
  useEffect: typeof useEffect | null;
  useState: typeof useState | null;
  useDebugValue: typeof useDebugValue | null;
  useRef: typeof useRef | null;
};

export type NonNullableObject<Obj extends Record<string, unknown>> = {
  [Key in keyof Obj]: NonNullable<Obj[Key]>;
};
