'use client';

import Millet from "@/components/layout/Home";
import { useState } from "react";
import MilletSpaceLoader from "./MilletSpaceLoader";



export default function Home() {

  const [loading ,setloading]= useState()

  console.log(setloading);
  

  if(loading){
    <MilletSpaceLoader/>
  }
  return (
   
    <>
    <Millet/>
  </>
  );
}
