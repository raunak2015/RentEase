import { Share, Alert, Platform, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * Copy text to clipboard and show a confirmation alert
 * @param {string} text - The text to copy
 * @param {string} label - Display label used in the confirmation message
 */
export const copyToClipboard = async (text, label = 'Text') => {
  try {
    await Clipboard.setStringAsync(String(text));
    Alert.alert('Copied!', `${label} copied to clipboard.`);
  } catch (error) {
    Alert.alert('Error', 'Failed to copy to clipboard');
  }
};

/**
 * Read text from clipboard
 * @returns {Promise<string>} clipboard text
 */
export const readFromClipboard = async () => {
  try {
    return await Clipboard.getStringAsync();
  } catch {
    return '';
  }
};

/**
 * Share a property listing via native share sheet
 * @param {object} property - The property object
 */
export const shareProperty = async (property) => {
  if (!property) return;

  const priceStr = property.price
    ? `₹${property.price.toLocaleString('en-IN')}/month`
    : 'Price on request';

  const message =
    `🏠 Check out this ${property.type || 'property'} on RentEase!\n\n` +
    `📌 ${property.title}\n` +
    `📍 ${property.address}\n` +
    `💰 ${priceStr}\n` +
    (property.propertyCode ? `🔑 Property Code: ${property.propertyCode}\n` : '') +
    `\nSearch for this property on RentEase using the code above.`;

  try {
    await Share.share({
      message,
      title: `RentEase – ${property.title}`,
    });
  } catch (error) {
    if (error.message !== 'The user did not share') {
      Alert.alert('Share failed', error.message || 'Could not share this property');
    }
  }
};

/**
 * Open phone dialer with the given number
 * @param {string} phone - Phone number to call
 */
export const callPhone = async (phone) => {
  if (!phone) {
    Alert.alert('No phone number', 'Owner has not provided a phone number.');
    return;
  }

  const cleaned = phone.replace(/\s+/g, '');
  const url = `tel:${cleaned}`;
  const supported = await Linking.canOpenURL(url);

  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Cannot Call', `Unable to open dialer for ${phone}`);
  }
};

/**
 * Open email client with a pre-filled email to the owner
 * @param {string} email - Owner email address
 * @param {string} propertyTitle - Property title for subject
 */
export const sendEmail = async (email, propertyTitle = 'your property') => {
  if (!email) {
    Alert.alert('No email', 'Owner has not provided an email address.');
    return;
  }

  const subject = encodeURIComponent(`Inquiry about: ${propertyTitle}`);
  const body = encodeURIComponent(
    `Hello,\n\nI found your listing "${propertyTitle}" on RentEase and would like to know more details.\n\nPlease get in touch at your earliest convenience.\n\nThank you.`
  );
  const url = `mailto:${email}?subject=${subject}&body=${body}`;

  const supported = await Linking.canOpenURL(url);
  if (supported) {
    await Linking.openURL(url);
  } else {
    Alert.alert('Cannot Open Email', `Unable to open email app for ${email}`);
  }
};

/**
 * Open WhatsApp chat with the owner (if available)
 * @param {string} phone - Phone number (with country code)
 * @param {string} propertyTitle - Property title for the pre-filled message
 */
export const openWhatsApp = async (phone, propertyTitle = 'your property') => {
  if (!phone) {
    Alert.alert('No phone number', 'Owner has not provided a phone number.');
    return;
  }

  // Strip non-digit chars and assume +91 if no country code
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) cleaned = `91${cleaned}`;

  const text = encodeURIComponent(
    `Hello! I found your listing "${propertyTitle}" on RentEase and I'm interested. Could you please share more details?`
  );

  const whatsappUrl = `whatsapp://send?phone=${cleaned}&text=${text}`;
  const supported = await Linking.canOpenURL(whatsappUrl);

  if (supported) {
    await Linking.openURL(whatsappUrl);
  } else {
    // Fallback: copy phone to clipboard
    await copyToClipboard(phone, 'Owner phone number');
    Alert.alert(
      'WhatsApp Not Installed',
      `WhatsApp is not installed. The owner's number has been copied to your clipboard.\n\n${phone}`
    );
  }
};
