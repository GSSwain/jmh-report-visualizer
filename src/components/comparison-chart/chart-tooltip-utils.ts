import { Chart, TooltipModel } from 'chart.js';

export function chartTooltipHandler(context: { chart: Chart; tooltip: TooltipModel<any> }, tooltipEl: HTMLElement) {
  const { chart, tooltip } = context;

  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  if (tooltip.body) {
    const title = tooltip.title.join(' ') || '';
    let innerHtml = `<div><strong>${title}</strong></div>`;

    tooltip.dataPoints.forEach(function (dataPoint) {
      const label = dataPoint.dataset.label || '';
      const value =
        chart.options.indexAxis === 'y'
          ? dataPoint.parsed.x
          : dataPoint.parsed.y;
      const color = (dataPoint.dataset.borderColor as string) || '#000';
      const style = `background-color: ${color}; border: 1px solid ${color}; width: 10px; height: 10px; display: inline-block; margin-right: 5px;`;

      innerHtml += `
                  <div style="margin-top: 5px;">
                      <div><span style="${style}"></span>${label}</div>
                      <div class="tooltip-score">Score: ${value?.toFixed(2) ?? 'N/A'}</div>
                  </div>
              `;
    });

    tooltipEl.innerHTML = innerHtml;
  }

  const { offsetLeft: positionX, offsetTop: positionY } = chart.canvas;
  const tooltipWidth = tooltipEl.offsetWidth;
  const chartWidth = chart.canvas.offsetWidth;

  let left = positionX + tooltip.caretX;

  // If tooltip overflows the right edge, shift it to the left
  if (left + tooltipWidth > chartWidth) {
    left = chartWidth - tooltipWidth;
  }

  // Ensure tooltip doesn't go off the left edge either (can happen with the shift)
  if (left < 0) {
    left = 0;
  }

  tooltipEl.style.opacity = '1';
  tooltipEl.style.left = left + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
}
