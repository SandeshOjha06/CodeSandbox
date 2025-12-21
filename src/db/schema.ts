import { id } from "date-fns/locale"
import { pgTable, text, uuid, timestamp, varchar } from "drizzle-orm/pg-core"

export const account = pgTable("accounts",{
  id: uuid("id").defaultRandom().primaryKey(),
 userId : uuid("userId").notNull().references(() => users.id),
 type : varchar("type", {length : 50}).notNull(),
 provider: text("provider"),
//  refreshToken : 
})

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})


export const role = pgTable("roles",{
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
})

export const userRole = pgTable("user_roles",{
  userId : uuid("userId").notNull().references(() => users.id),
  roleId : uuid("roleId").notNull().references(() => role.id),
})