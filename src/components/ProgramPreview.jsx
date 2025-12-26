"use client";

import React from "react";

export default function ProgramPreview({ data }) {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">Program Preview</p>
          <p className="text-xs text-slate-500">
            Vista previa del JSON generado por Said Trainer
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
          JSON
        </span>
      </div>
      <div className="max-h-[65vh] overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-800">
        {data ? (
          <pre className="whitespace-pre-wrap break-words font-mono">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <p className="text-slate-500">
            Genera un programa para ver aquí la vista previa.
          </p>
        )}
      </div>
    </div>
  );
}
