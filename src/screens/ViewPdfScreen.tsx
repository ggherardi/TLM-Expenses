import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { BusinessEvent } from '../lib/models/BusinessEvent';
import { useCustomHeaderWithButtonAsync } from '../lib/components/CustomHeaderComponent';
import Pdf from 'react-native-pdf';
import { EmailManager, EmailAttachment } from '../lib/EmailManager';
import { Utility } from '../lib/Utility';
import { UserProfile } from '../lib/models/UserProfile';
import dataContext from '../lib/models/DataContext';

const ViewPdfScreen = ({ navigation, route }: any) => {
  const event: BusinessEvent = route.params.event;

  useEffect(() => {
    useCustomHeaderWithButtonAsync(
      navigation,
      event.name,
      () => { sendEmail() },
      'paper-plane',
      'PDF Nota spese',
      undefined,
      undefined,
      { marginLeft: -2 }
    );
  }, []);

  const sendEmail = async () => {
    const attachments: EmailAttachment[] = [];
    let userProfile: UserProfile = Utility.GetUserProfile();
    const userProfileAllData = dataContext.UserProfile.getAllData();
    if (userProfileAllData && userProfileAllData.length) {
      userProfile = userProfileAllData[0];
    }
    const pdfFullFilePath = `${route.params.documentPath}/${event.pdfFullFilePath}`
    attachments.push({ path: pdfFullFilePath, mimeType: 'application/pdf' });
    const subject = `Nota spese ${event.city} ${event.name} ${Utility.FormatDateDDMMYYYY(event.startDate)} - ${Utility.FormatDateDDMMYYYY(event.endDate)} ${userProfile.surname} ${userProfile.name}`;
    EmailManager.send([userProfile.email], subject, "Mail inviata dall'app", attachments);
    // EmailManager.send(["nota-spese@tourleadermanagement.ch", "giamalfred@gmail.com"], subject, "Mail inviata dall'app", attachments);
    // EmailManager.send(["nota-spese@tourleadermanagement.ch", "giamalfred@gmail.com", "enricogherardi@hotmail.com"], subject, "Mail inviata dall'app con pdf generato", attachments);
    // EmailManager.send(["giamalfred@gmail.com"], subject, `Mail inviata dall'APP "Nota spese TLM"`, attachments);
  }
  console.log(`PDF Location: file:///${event.pdfFullFilePath}`);

  const [pdfSource] = useState<any>({ uri: `file:///${route.params.documentPath}/${event.pdfFullFilePath}`, cache: true });

  return (
    <View style={styles.container}>
      {pdfSource != undefined && pdfSource != null && (
        <Pdf
          trustAllCerts={false}
          source={pdfSource}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
          onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
          }}
          style={styles.pdf} />
      )}
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    // marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    // height: 500,
  }
});

export default ViewPdfScreen;
