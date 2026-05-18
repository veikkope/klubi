import { defineField, defineType } from "sanity";

export const ravintolaKayttajaArvostelu = defineType({
  name: "ravintolaKayttajaArvostelu",
  title: "Käyttäjän ravintola-arvostelu",
  type: "document",
  fields: [
    defineField({
      name: "reviewerName",
      title: "Arvostelijan nimi",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reviewerEmail",
      title: "Arvostelijan sähköposti",
      description: "Ei näytetä julkisesti.",
      type: "email",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "restaurant",
      title: "Ravintola",
      type: "reference",
      to: [{ type: "ravintola" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "stars",
      title: "Tähdet (1–5)",
      type: "number",
      validation: (rule) => rule.required().integer().min(1).max(5),
    }),
    defineField({
      name: "comment",
      title: "Kommentti",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required().max(1000),
    }),
    defineField({
      name: "status",
      title: "Tila",
      type: "string",
      options: {
        list: [
          { title: "Odottaa hyväksyntää", value: "pending" },
          { title: "Hyväksytty (julkinen)", value: "approved" },
          { title: "Hylätty", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "submittedAt",
      title: "Lähetysaika",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
  ],
  orderings: [
    { title: "Lähetysaika (uusin ensin)", name: "submittedAtDesc", by: [{ field: "submittedAt", direction: "desc" }] },
    { title: "Tila", name: "statusAsc", by: [{ field: "status", direction: "asc" }] },
  ],
  preview: {
    select: { name: "reviewerName", restaurant: "restaurant.name", status: "status", stars: "stars" },
    prepare({ name, restaurant, status, stars }) {
      const statusLabel: Record<string, string> = {
        pending: "⏳ Odottaa",
        approved: "✓ Julkinen",
        rejected: "✕ Hylätty",
      };
      return {
        title: `${name} → ${restaurant ?? "?"}`,
        subtitle: `${statusLabel[status] ?? status} · ${stars ? "★".repeat(stars) : ""}`,
      };
    },
  },
});
