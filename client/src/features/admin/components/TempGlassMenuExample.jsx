import React, { useState } from 'react';
import {
  DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  LiquidGlassWorkspaceButton,
} from '../../../components/ui/LiquidGlass';

const PAGE_BG = 'bg-gray-400';

/**
 * Примеры вызова LiquidGlassWorkspaceButton с разными tune.
 * Меняйте объекты ниже — визуал пересчитывается через liquidGlassWorkspaceDims.
 */
const TUNE_DEFAULT = DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE;

/** Компакт: меньше чекбокс, уже колонка; шрифт тянется за check (scaleFontWithCheck: true). */
const TUNE_COMPACT = {
  ...DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  maxWidthRem: 16,
  checkSizePx: 18,
  labelFontRem: 1,
  scaleFontWithCheck: true,
};

/** Крупный: большой индикатор и широкая полоса. */
const TUNE_LARGE = {
  ...DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  maxWidthRem: 36,
  checkSizePx: 40,
  labelFontRem: 1.1,
  scaleFontWithCheck: true,
};

/** Независимый шрифт: большой чекбокс, текст остаётся как в labelFontRem без r. */
const TUNE_BIG_CHECK_SMALL_TYPE = {
  ...DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE,
  maxWidthRem: 24,
  checkSizePx: 34,
  labelFontRem: 0.75,
  scaleFontWithCheck: false,
};

function DemoRow({ title, subtitle, tune, label, defaultChecked }) {
  return (
    <section className="w-full">
      <h2 className="mb-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-700/90">
        {title}
      </h2>
      {subtitle ? (
        <p className="mb-2 text-left text-[11px] leading-snug text-gray-600/95">{subtitle}</p>
      ) : null}
      <div
        style={{ maxWidth: `${tune.maxWidthRem}rem` }}
        className="mx-auto w-full"
      >
        <LiquidGlassWorkspaceButton
          tune={tune}
          label={label}
          defaultChecked={defaultChecked}
        />
      </div>
    </section>
  );
}

function ControlledDemo() {
  const [on, setOn] = useState(true);
  return (
    <section className="w-full">
      <h2 className="mb-1 text-left text-xs font-semibold uppercase tracking-wide text-gray-700/90">
        Контролируемый режим
      </h2>
      <p className="mb-2 text-left text-[11px] leading-snug text-gray-600/95">
        <code className="rounded bg-gray-500/25 px-1">checked</code> +{' '}
        <code className="rounded bg-gray-500/25 px-1">onCheckedChange</code> — сейчас:{' '}
        <strong>{on ? 'вкл.' : 'выкл.'}</strong>
      </p>
      <div
        style={{ maxWidth: `${TUNE_DEFAULT.maxWidthRem}rem` }}
        className="mx-auto w-full"
      >
        <LiquidGlassWorkspaceButton
          tune={TUNE_DEFAULT}
          label="Controlled workspace"
          checked={on}
          onCheckedChange={setOn}
        />
      </div>
    </section>
  );
}

const TempGlassMenuExample = () => (
  <div
    className={`min-h-screen flex flex-col items-center justify-center ${PAGE_BG} p-6 font-[Inter,system-ui,sans-serif]`}
  >
    <div className="mx-auto flex w-full max-w-lg flex-col gap-10">
      <header className="text-center">
        <h1 className="text-base font-semibold text-gray-800">Liquid Glass — варианты tune</h1>
        <p className="mt-1 text-xs text-gray-600">
          Клик по кнопке переключает индикатор. Параметры tune:{' '}
          <code className="rounded bg-gray-500/25 px-1">maxWidthRem</code>,{' '}
          <code className="rounded bg-gray-500/25 px-1">checkSizePx</code>,{' '}
          <code className="rounded bg-gray-500/25 px-1">labelFontRem</code>,{' '}
          <code className="rounded bg-gray-500/25 px-1">scaleFontWithCheck</code>
        </p>
      </header>

      <DemoRow
        title="По умолчанию"
        subtitle={`maxWidthRem: ${TUNE_DEFAULT.maxWidthRem}, checkSizePx: ${TUNE_DEFAULT.checkSizePx}, labelFontRem: ${TUNE_DEFAULT.labelFontRem}, scaleFontWithCheck: ${TUNE_DEFAULT.scaleFontWithCheck}`}
        tune={TUNE_DEFAULT}
        label="Workspace (default)"
      />

      <DemoRow
        title="Компакт (изначально выкл.)"
        subtitle={`defaultChecked: false — кольцо без галочки; maxWidthRem: ${TUNE_COMPACT.maxWidthRem}, checkSizePx: ${TUNE_COMPACT.checkSizePx}`}
        tune={TUNE_COMPACT}
        label="Compact row"
        defaultChecked={false}
      />

      <DemoRow
        title="Крупный"
        subtitle={`maxWidthRem: ${TUNE_LARGE.maxWidthRem}, checkSizePx: ${TUNE_LARGE.checkSizePx}, labelFontRem: ${TUNE_LARGE.labelFontRem}`}
        tune={TUNE_LARGE}
        label="Large workspace"
      />

      <DemoRow
        title="Большой чекбокс, мелкий текст"
        subtitle={`checkSizePx: ${TUNE_BIG_CHECK_SMALL_TYPE.checkSizePx}, labelFontRem: ${TUNE_BIG_CHECK_SMALL_TYPE.labelFontRem}, scaleFontWithCheck: false`}
        tune={TUNE_BIG_CHECK_SMALL_TYPE}
        label="Decoupled font"
      />

      <ControlledDemo />
    </div>
  </div>
);

export default TempGlassMenuExample;

/** @deprecated используйте DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE из `components/ui/LiquidGlass` */
export const WORKSPACE_BUTTON_TUNE = DEFAULT_LIQUID_GLASS_WORKSPACE_TUNE;
