import data from "@/data/support-contacts.json";
import { SupportContactSchema, type SupportContact } from "@/lib/contracts";

const contacts = SupportContactSchema.array().parse(data);

/** Verified support lines for an ISO 3166-1 alpha-2 country; empty when there are none. */
export function getSupportContacts(country: string | null): SupportContact[] {
  if (country === null) return [];
  const code = country.toUpperCase();
  return contacts.filter((contact) => contact.country === code);
}
