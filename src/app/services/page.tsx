import { ServicesClient } from "./client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services | RCV.Media",
  description: "Explore our professional photography services: seniors, portraits, sports, events, graduation, and team media days.",
};

export default function ServicesPage() {
  return <ServicesClient />;
}
