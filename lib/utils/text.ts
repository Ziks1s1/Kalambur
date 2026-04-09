export function repairMojibake(value: string) {
  if (!value || !/[РС]/.test(value)) {
    return value;
  }

  try {
    const repaired = Buffer.from(value, "latin1").toString("utf8");
    const repairedCyrillicCount = (repaired.match(/[А-Яа-яЁё]/g) ?? []).length;
    const originalCyrillicCount = (value.match(/[А-Яа-яЁё]/g) ?? []).length;

    return repairedCyrillicCount > originalCyrillicCount ? repaired : value;
  } catch {
    return value;
  }
}

export function repairTextList(values: string[]) {
  return values.map(repairMojibake);
}
