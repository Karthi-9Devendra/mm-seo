// in types/index.ts

export interface Doctor {
  imageUrl?: string;
  _id: string;
  id: string;
  npi: string;
  firstName: string;
  lastName: string;
  entityTypeCode: string;
  replacementNpi: string;
  enumerationDate: string;
  lastUpdateDate: string;
  npiDeactivationReasonCode: string;
  npiDeactivationDate: string | null;
  npiReactivationDate: string | null;
  certificationDate: string;
  businessEmail: string;
  email: string;
  user: DoctorUser;
  addresses: DoctorAddress[];
  providerTaxonomies: DoctorTaxonomy[];
  state: string;
  city: string;
  specialization: string;
}

export interface DoctorUser {
  lastName: string;
  firstName: string;
  genderCode: string;
  credential: string;
  providerId: number;
  namePrefix: string;
  otherCredential: string | null;
  nameSuffix: string;
  isSoleProprietor: boolean;
  middleName: string;
  id: number;
}

export interface DoctorAddress {
  telephoneNumber: string;
  addressType: string;
  postalCode: string;
  secondLineAddress: string;
  postalCodeNew: string;
  cityName: string;
  stateName: string;
  providerId: number;
  countryCode: string;
  cityNameNew: string;
  faxNumber: string;
  id: number;
  firstLineAddress: string;
}

export interface DoctorTaxonomy {
  providerLicenseNumberStateCode: string;
  createdAt: string;
  providerId: number;
  taxonomyId: number;
  id: number;
  healthcareProviderPrimaryTaxonomySwitch: boolean;
  taxonomy: Taxonomy;
  providerLicenseNumber: string;
  updatedAt: string;
}

export interface Taxonomy {
  createdAt: string;
  code: string;
  notes: string;
  isDoctor: number;
  displayName: string;
  specialization: string;
  definition: string;
  section: string;
  id: number;
  classification: string;
  grouping: string;
  updatedAt: string;
}