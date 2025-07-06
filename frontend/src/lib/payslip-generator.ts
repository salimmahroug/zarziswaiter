import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface PayslipData {
  server: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  period: {
    start: Date;
    end: Date;
  };
  events: Array<{
    id: string;
    clientName: string;
    eventType: string;
    date: Date;
    location: string;
    amountDue: number;
    amountPaid: number;
    isPaid: boolean;
    paymentDate?: Date;
    paymentMethod?: string;
  }>;
  summary: {
    totalEvents: number;
    totalEarnings: number;
    totalPaid: number;
    totalPending: number;
  };
  paymentInfo?: {
    paymentDate: Date;
    paymentMethod: string;
    paymentReference?: string;
  };
}

export class PayslipGenerator {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 3,
    }).format(amount);
  }

  private static formatDate(date: Date): string {
    return format(date, 'dd/MM/yyyy', { locale: fr });
  }

  private static generatePayslipHTML(data: PayslipData): string {
    const { server, period, events, summary, paymentInfo } = data;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">FICHE DE PAIE</h1>
          <h2 style="color: #64748b; margin: 10px 0 0 0; font-size: 18px;">Waiter of Zarzis</h2>
        </div>

        <!-- Info Section -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="flex: 1; margin-right: 20px;">
            <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Informations du Serveur</h3>
            <p><strong>Nom :</strong> ${server.name}</p>
            <p><strong>ID :</strong> ${server.id}</p>
            ${server.phone ? `<p><strong>Téléphone :</strong> ${server.phone}</p>` : ''}
            ${server.email ? `<p><strong>Email :</strong> ${server.email}</p>` : ''}
            ${server.address ? `<p><strong>Adresse :</strong> ${server.address}</p>` : ''}
          </div>
          
          <div style="flex: 1;">
            <h3 style="color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Période de Paie</h3>
            <p><strong>Du :</strong> ${this.formatDate(period.start)}</p>
            <p><strong>Au :</strong> ${this.formatDate(period.end)}</p>
            ${paymentInfo ? `
              <p><strong>Date de paiement :</strong> ${this.formatDate(paymentInfo.paymentDate)}</p>
              <p><strong>Méthode :</strong> ${paymentInfo.paymentMethod}</p>
              ${paymentInfo.paymentReference ? `<p><strong>Référence :</strong> ${paymentInfo.paymentReference}</p>` : ''}
            ` : ''}
          </div>
        </div>

        <!-- Summary -->
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #1e293b; margin-top: 0;">Résumé des Gains</h3>
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
            <div style="margin: 10px 0;">
              <p style="margin: 0; color: #64748b;">Nombre d'événements</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2563eb;">${summary.totalEvents}</p>
            </div>
            <div style="margin: 10px 0;">
              <p style="margin: 0; color: #64748b;">Total gagné</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #059669;">${this.formatCurrency(summary.totalEarnings)}</p>
            </div>
            <div style="margin: 10px 0;">
              <p style="margin: 0; color: #64748b;">Total payé</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #059669;">${this.formatCurrency(summary.totalPaid)}</p>
            </div>
            <div style="margin: 10px 0;">
              <p style="margin: 0; color: #64748b;">En attente</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #dc2626;">${this.formatCurrency(summary.totalPending)}</p>
            </div>
          </div>
        </div>

        <!-- Events Table -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; margin-bottom: 15px;">Détail des Événements</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Date</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Client</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Type</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: left;">Lieu</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">Montant Dû</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">Montant Payé</th>
                <th style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">Statut</th>
              </tr>
            </thead>
            <tbody>
              ${events.map(event => `
                <tr>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${this.formatDate(event.date)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${event.clientName}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${event.eventType}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px;">${event.location}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">${this.formatCurrency(event.amountDue)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: right;">${this.formatCurrency(event.amountPaid)}</td>
                  <td style="border: 1px solid #e2e8f0; padding: 8px; text-align: center;">
                    <span style="padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; color: white; background: ${event.isPaid ? '#059669' : '#dc2626'};">
                      ${event.isPaid ? 'PAYÉ' : 'EN ATTENTE'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; color: #64748b; font-size: 12px;">
          <p>Document généré le ${this.formatDate(new Date())}</p>
          <p>Waiter of Zarzis - Système de Gestion des Serveurs</p>
        </div>
      </div>
    `;
  }

  static async generatePDF(data: PayslipData): Promise<void> {
    try {
      // Create a temporary container for HTML
      const container = document.createElement('div');
      container.innerHTML = this.generatePayslipHTML(data);
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      container.style.width = '800px';
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: container.offsetHeight,
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 190; // A4 width minus margins
      const pageHeight = 297; // A4 height
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20; // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      // Generate filename
      const filename = `fiche-paie-${data.server.name.replace(/\s+/g, '-')}-${format(data.period.start, 'yyyy-MM')}.pdf`;
      
      // Download PDF
      pdf.save(filename);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer la fiche de paie. Veuillez réessayer.');
    }
  }

  static async generateAndDownload(data: PayslipData): Promise<void> {
    await this.generatePDF(data);
  }
}
