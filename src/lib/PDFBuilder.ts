import { Utility } from './Utility';
import { Bootstrap } from './Bootstrap';
import { BusinessEvent } from './models/BusinessEvent';
import { ExpenseReport } from './models/ExpenseReport';
import { generatePDF, PDFResult } from 'react-native-html-to-pdf';
import { degrees, PDFDocument, rgb } from 'pdf-lib';
import { Constants } from './Constants';
import dataContext from './models/DataContext';
import { Images } from '../assets/Images';
import { FileManager } from './FileManager';
import { Buffer } from 'buffer'

export const PDFBuilder = {
  createExpensesPdfAsync: async (event: BusinessEvent, fileName: string): Promise<PDFResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const directory = `Documents`;
        console.log(`Creating pdf in directory: `, directory);
        const expenses = Utility.GetExpensesForEvent(event);
        const generatedHtml = await PDFBuilder.generateHtml(event, expenses);
        const options = {
          html: generatedHtml,
          fileName: fileName,
          directory: directory,
        };
        let file = await generatePDF(options).catch(e => console.log("Error while creating pdf: ", e));
        if (file) {
          console.log(`File created: `, file.filePath);
          // await PDFBuilder.addWatermarkToPages(file);
          resolve(file);
        } else {
          reject(undefined);
        }
      }
      catch (ex) {
        console.log(ex);
      }
    });
  },

  addWatermarkToPages: async (file: PDFResult) => {
    const existingPDFBytes = await FileManager.getFile(file.filePath as string, 'base64');
    const pdfDoc = await PDFDocument.load(Uint8Array.from(Buffer.from(existingPDFBytes as string, 'base64')));
    const pages = pdfDoc.getPages();
    const imageByteArray = Uint8Array.from(Buffer.from(Images.tlm_logo.base_64_no_header, 'base64'));
    const embededImage = await pdfDoc.embedPng(imageByteArray);
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const { width, height } = page.getSize();
      if (embededImage) {
        page.drawImage(embededImage, {
          x: 150,
          y: height / 2 - 250,
          rotate: degrees(45),
          opacity: 0.20,
        });
      }
    }
    const pdfBytes = await pdfDoc.save();
    FileManager.saveFromBase64(file.filePath as string, Buffer.from(pdfBytes).toString('base64'));
  },

  generateHtml: async (event: BusinessEvent, expenses: ExpenseReport[]): Promise<string> => {
    return new Promise<string>(async (resolve, reject) => {
      const documentDir = await FileManager.getDocumentDir();
      const userProfile = Utility.GetUserProfile();
      let travelledKmsRefund = 0;
      const refundExpense = ExpenseReport.generateKmRefund(event);
      if (refundExpense.name == Constants.Generic.TravelRefundExpenseName) {
        expenses.push(refundExpense);
      }
      Utility.SortByDate(expenses, 'date', false);
      const totalAmount: number = Utility.CalculateTotalAmount(expenses, 'amount')
      let html = `
      <style>
        ${Bootstrap.style}
      
        .font-20 {
          font-size: 20px;
        }
        
        .bg-grey {
          background-color: #969696;
        }
  
        .tlm-image {
          max-width: 600px;
          max-heigth: 680px;
          align-self: center;
          justify-content: center;
        }
        
        .watermark {
          // position: fixed;
          // top: 50;
          // left: 50%;
          // transform: rotate(-25deg);
          width: 80%;
          opacity: 1;
          z-index: 999;
          pointer-events: none;
        }

        @media print {
          .pagebreak { page-break-before: always; }
        }      
      </style>     
        <img src='${Images.tlm_logo.base_64}' width="300" />
        <h1 class="text-center mt-5">NOTA SPESE</h1>
        
        <div class="text-right pt-3">        
          <span>Data:</span>
          <span>${Utility.FormatDateDDMMYYYY(new Date().toString())}</span>
        </div>      
  
        <div class="mt-4 mb-5 row border border-dark p-3">
          <div class="col-6">
            <span>Gruppo:</span>
            <span class="font-weight-bold">${event.name}</span>
          </div>        
          <div class="col-6">
            <span>Date evento:</span>
            <span class="font-weight-bold">${Utility.FormatDateDDMMYYYY(event.startDate)} - ${Utility.FormatDateDDMMYYYY(event.endDate)}</span>
          </div>
        </div>
  
        <div class="my-5 row border-bottom">
          <div class="col-6">
            <span>Hostess/Tour Leader:</span>
            <span class="font-weight-bold">${userProfile.name} ${userProfile.surname}</span>
          </div>
          <div class="col-6">
            <span>Destinazione:</span>
            <span class="font-weight-bold">${event.city}</span>
          </div>
        </div>
  
        <div class="${event.needCarRefund ? '' : 'd-none'} border-bottom my-5">
          <div>
            <span>Località di partenza:</span>
            <span class="font-weight-bold">${event.refundStartingCity}</span>
          </div>
          <div>
            <span>Località di arrivo:</span>
            <span class="font-weight-bold">${event.refundArrivalCity}</span>
          </div>
          <div>
            <span>Totale KM percorsi:</span>
            <span class="font-weight-bold">${event.totalTravelledKms}</span>
          </div>
        </div>
  
        <table class="table">
          <thead>          
            <tr>
              <th>Data</th>
              <th>Tipo di spesa</th>
              <th>Note</th>
              <th class="text-right">Costo</th>
            </tr>
          </thead>
          <tbody>              
      `;

      // Main table
      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        html += `
            <tr>
              <td>${expense.date ? Utility.FormatDateDDMMYYYY(expense.date) : ''}</td>
              <td>${expense.name}</td>
              <td>${expense.description}</td>
              <td class="text-right">${expense.amount.toFixed(2)} ${event.mainCurrency.symbol}</td>
            </tr>
        `;
      }
      html += `
            <tr>
              <td></td>
              <td></td>
              <td>
                <div class="py-3 font-20 font-weight-bold">
                  <span>TOTALE NOTA SPESE</span>
                </div>
              </td>
              <td>
                <div class="bg-warning py-3 font-20 font-weight-bold text-right pr-2">${totalAmount?.toFixed(2)} ${event.mainCurrency.symbol}</div>
              </td>
            </tr>
          </tbody>
        </table>`;

      // Cash fund table
      html += `
        <div class="mt-5 row">
          <div class="col-6">
            <table class="table table-striped">
              <tbody>
                <tr>
                  <td>Totale nota spese</td>
                  <td class="text-right">${totalAmount?.toFixed(2)} ${event.mainCurrency.symbol}</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>Fondo cassa ricevuto</td>
                  <td class="text-right">${event.cashFund && Number(event.cashFund).toFixed(2)} ${event.mainCurrency.symbol}</td>
                  <td>=</td>
                </tr>
                <tr class="border-bottom">
                  <td>Totale dovuto al Tour Leader</td>
                  <td class="text-right">${(totalAmount - Number(event.cashFund)).toFixed(2)} ${event.mainCurrency.symbol}</td>
                  <td />
                </tr>
              </tbody>
            </table>   
          </div>
        </div>`;

      html += `
      </div>
      `;
      console.log(expenses);
      // GG: I remove the travel refund expense since it has no image
      expenses = expenses.filter(e => e.name != Constants.Generic.TravelRefundExpenseName);

      for (let i = 0; i < expenses.length; i++) {
        const expense = expenses[i];
        const photoFilePath = `${documentDir}/${expense.photoFilePath}`;
        // console.log(`Expense with name: ${expense.name}, with amount: ${expense.amount} has picture in location: ${photoFilePath}`)
        const encodedImage = await FileManager.encodeBase64(photoFilePath);
        const isEven = i % 2 == 0;
        const shouldPageBreak = i % 4 == 0;
        html += shouldPageBreak ? `
        <div class="pagebreak"></div>` : ``;
        html += isEven ? `
          <div class="row my-5">` : ``;
        html += `
            <div class="col-6 text-center">
              <span>Scontrino per la spesa:</span>
              <span>${expense.name} - ${Utility.FormatDateDDMMYYYY(expense.date)} - ${expense.amount} ${event.mainCurrency.symbol}</span>
              <div class="d-flex" style="height: 550px; justify-content: center;">
                <img class="tlm-image mt-5" src="data:image/jpg;base64, ${encodedImage}" height="500">
              </div>              
            </div>`;
        html += !isEven ? `
          </div>` : ``;
      }
      resolve(html);
    })
  },
}
