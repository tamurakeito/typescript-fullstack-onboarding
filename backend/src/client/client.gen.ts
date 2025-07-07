import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

const Widget = z
  .object({
    id: z.string(),
    weight: z.number().int(),
    color: z.enum(["red", "blue"]),
  })
  .passthrough();
const WidgetList = z.object({ items: z.array(Widget) }).passthrough();
const Error = z
  .object({ code: z.number().int(), message: z.string() })
  .passthrough();
const WidgetMergePatchUpdate = z
  .object({
    id: z.string(),
    weight: z.number().int(),
    color: z.enum(["red", "blue"]),
  })
  .partial()
  .passthrough();
const AnalyzeResult = z
  .object({ id: z.string(), analysis: z.string() })
  .passthrough();

export const schemas = {
  Widget,
  WidgetList,
  Error,
  WidgetMergePatchUpdate,
  AnalyzeResult,
};

const endpoints = makeApi([
  {
    method: "get",
    path: "/widgets",
    alias: "Widgets_list",
    description: `List widgets`,
    requestFormat: "json",
    response: WidgetList,
  },
  {
    method: "post",
    path: "/widgets",
    alias: "Widgets_create",
    description: `Create a widget`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: Widget,
      },
    ],
    response: Widget,
  },
  {
    method: "get",
    path: "/widgets/:id",
    alias: "Widgets_read",
    description: `Read widgets`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Widget,
  },
  {
    method: "patch",
    path: "/widgets/:id",
    alias: "Widgets_update",
    description: `Update a widget`,
    requestFormat: "json",
    parameters: [
      {
        name: "body",
        type: "Body",
        schema: WidgetMergePatchUpdate,
      },
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: Widget,
  },
  {
    method: "delete",
    path: "/widgets/:id",
    alias: "Widgets_delete",
    description: `Delete a widget`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: z.void(),
  },
  {
    method: "post",
    path: "/widgets/:id/analyze",
    alias: "Widgets_analyze",
    description: `Analyze a widget`,
    requestFormat: "json",
    parameters: [
      {
        name: "id",
        type: "Path",
        schema: z.string(),
      },
    ],
    response: AnalyzeResult,
  },
]);

export const api = new Zodios(endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options);
}
