
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const generateCacaoReport = async (
  element: HTMLElement,
  filename: string,
  onLoadingChange?: (isLoading: boolean) => void
) => {
  if (!element) return;
  
  if (onLoadingChange) onLoadingChange(true);
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 1200, 
      onclone: (clonedDoc) => {
        const report = clonedDoc.getElementById('report-content');
        if (report) {
          report.style.boxShadow = 'none';
          report.style.borderRadius = '0';
          report.style.border = 'none';
          report.classList.remove('p-8', 'md:p-16', 'space-y-16');
          report.classList.add('p-8', 'space-y-8');
          
          const cards = report.querySelectorAll('.p-8');
          cards.forEach(card => {
              card.classList.remove('p-8');
              card.classList.add('p-4', 'border', 'border-slate-300');
              (card as HTMLElement).style.boxShadow = 'none';
          });
          
          const cells = report.querySelectorAll('td, th');
          cells.forEach(cell => {
              cell.classList.remove('py-4');
              cell.classList.add('py-1');
              (cell as HTMLElement).style.fontSize = '10px';
          });
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * w) / canvas.width;
    
    let heightLeft = imgH;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, w, imgH);
    heightLeft -= h;

    while (heightLeft >= 0) {
      position = heightLeft - imgH;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, w, imgH);
      heightLeft -= h;
    }

    pdf.save(filename);
  } catch (error) {
    console.error('Error al generar PDF:', error);
  } finally {
    if (onLoadingChange) onLoadingChange(false);
  }
};
