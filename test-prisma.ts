import { PrismaClient, Prisma } from "@prisma/client";

const base = new PrismaClient();
const t1 = base.builderProjectAnimationTimeline.findMany;
console.log(!!t1);
