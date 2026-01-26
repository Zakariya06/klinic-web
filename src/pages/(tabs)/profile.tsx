import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import apiClient from "@/api/client";
import { UserRole } from "@/types/userTypes";
import { Address } from "@/types/profileTypes";

import { useUserStore } from "@/store/userStore";
import {
  useUserProfileStore,
  useDoctorProfileStore,
  useLaboratoryProfileStore,
  useProfileUIStore,
} from "@/store/profileStore";

import useProfileApi from "@/hooks/useProfileApi";

// Modular components (assumed web versions exist)
import ProfileHeader from "@/components/profile/ProfileHeader";
import UserProfileForm from "@/components/profile/UserProfileForm";
import DoctorProfileForm from "@/components/profile/DoctorProfileForm";
import LaboratoryProfileForm from "@/components/profile/LaboratoryProfileForm";
import SaveButton from "@/components/profile/SaveButton";
import ImagePickerModal from "@/components/profile/ImagePickerModal";
import DeleteAccountModal from "@/components/profile/DeleteAccountModal";
import { IoCloseCircleOutline, IoTrash } from "react-icons/io5";
import { BiEdit } from "react-icons/bi";
import { AnimatedModal } from "@/components/modal/AnimatedModal";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  // Zustand stores
  const userProfileStore = useUserProfileStore();
  const doctorProfileStore = useDoctorProfileStore();
  const laboratoryProfileStore = useLaboratoryProfileStore();
  const uiStore = useProfileUIStore();

  // Local UI state
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Hidden inputs for web picking
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const coverImageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  // API hooks
  const userApi = useProfileApi({
    endpoint: "/api/v1/user",
    onSuccess: (data) => {
      useUserStore.getState().setUser(data);
    },
  });

  const profileApi = useProfileApi({ endpoint: "/api/v1/profile" });

  const userProfileApi = useProfileApi({ endpoint: "/api/v1/user-profile" });
  const doctorProfileApi = useProfileApi({
    endpoint: "/api/v1/doctor-profile",
  });
  const laboratoryProfileApi = useProfileApi({
    endpoint: "/api/v1/laboratory-profile",
  });

  useEffect(() => {
    if (user) {
      setBasicInfo({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    try {
      uiStore.setLoading(true);

      await userApi.fetchData();

      try {
        const profileData = await profileApi.fetchData();

        if (profileData && profileData.profile) {
          if (
            user?.role === UserRole.USER ||
            user?.role === UserRole.DELIVERY_BOY
          ) {
            userProfileStore.updateFromApiResponse(profileData.profile);
          } else if (user?.role === UserRole.DOCTOR) {
            doctorProfileStore.updateFromApiResponse(profileData.profile);
          } else if (user?.role === UserRole.LABORATORY) {
            laboratoryProfileStore.updateFromApiResponse(profileData.profile);
          }

          // cities
          const cities =
            (Array.isArray(profileData.availableCities) &&
              profileData.availableCities) ||
            (Array.isArray(profileData.avilableCities) &&
              profileData.avilableCities) ||
            [];
          if (cities.length) {
            setFilteredCities(cities);
            uiStore.setCities(cities);
          }

          // lab categories
          if (user?.role === UserRole.LABORATORY) {
            const cats = Array.isArray(
              profileData.availableLabServiceCategories,
            )
              ? profileData.availableLabServiceCategories
              : [
                  "Blood Test",
                  "Urine Test",
                  "Imaging",
                  "Pathology",
                  "Microbiology",
                ];
            uiStore.setLabServiceCategories(cats);
          }

          // doctor lists
          if (user?.role === UserRole.DOCTOR) {
            const specs = (Array.isArray(
              profileData.availableSpecializations,
            ) &&
              profileData.availableSpecializations) ||
              (Array.isArray(profileData.avilableSpecializations) &&
                profileData.avilableSpecializations) || [
                "Cardiologist",
                "Dermatologist",
                "Pediatrician",
                "Neurologist",
                "Orthopedic Surgeon",
              ];
            doctorProfileStore.setAvailableSpecializations(specs);

            const quals = (Array.isArray(profileData.availableQualifications) &&
              profileData.availableQualifications) ||
              (Array.isArray(profileData.avilableQualifications) &&
                profileData.avilableQualifications) || [
                "MBBS",
                "MD",
                "MS",
                "DM",
              ];
            doctorProfileStore.setAvailableQualifications(quals);
          }
        } else {
          // legacy
          if (
            user?.role === UserRole.USER ||
            user?.role === UserRole.DELIVERY_BOY
          ) {
            userProfileStore.updateFromApiResponse(profileData);
          } else if (user?.role === UserRole.DOCTOR) {
            doctorProfileStore.updateFromApiResponse(profileData);
          } else if (user?.role === UserRole.LABORATORY) {
            laboratoryProfileStore.updateFromApiResponse(profileData);
          }
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          // no profile yet; create on save
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
    } finally {
      uiStore.setLoading(false);
    }
  };

 

  const handleUpdateBasicInfo = async () => {
    try {
      uiStore.setUpdating(true);

      const response = await apiClient.post("/api/v1/update-user-basic-info", {
        name: basicInfo.name,
        email: basicInfo.email,
        phone: basicInfo.phone,
        profilePicture: user?.profilePicture,
      });

      if (response.data) {
        setUser(response.data);
        setIsEditingBasicInfo(false);
        alert("Basic info updated successfully");
      }
    } catch (error) {
      console.error("Error updating basic info:", error);
      alert("Failed to update basic info");
    } finally {
      uiStore.setUpdating(false);
    }
  };

  // --- Web upload helper (presigned URL flow) ---
  const uploadFileWeb = async (file: File): Promise<string | null> => {
    try {
      const fileType = file.type || "application/octet-stream";
      const fileName = file.name || `file-${Date.now()}`;

      const urlResponse = await apiClient.post("/api/v1/upload-url", {
        fileType,
        fileName,
      });
      const { uploadUrl, publicUrl } = urlResponse.data;

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": fileType },
      });

      return publicUrl;
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Failed to upload file");
      return null;
    }
  };

  // Profile picture
  const handleProfilePicturePress = () => {
    uiStore.setShowImageOptions(true);
  };

  const openGallery = async () => {
    // On web, just open file picker
    profileImageInputRef.current?.click();
  };

  const onPickProfileImage = async (file?: File | null) => {
    if (!file) return;

    try {
      uiStore.setUploadingImage(true);
      const imageUrl = await uploadFileWeb(file);
      if (!imageUrl) return;

      const response = await apiClient.post("/api/v1/update-user-basic-info", {
        name: user?.name,
        email: user?.email,
        phone: user?.phone,
        profilePicture: imageUrl,
      });

      if (response.data) setUser(response.data);
    } catch (e) {
      console.error("Error uploading profile picture:", e);
      alert("Failed to upload profile picture");
    } finally {
      uiStore.setUploadingImage(false);
      uiStore.setShowImageOptions(false);
    }
  };

  // PDFs
  const handleDocumentPick = async () => {
    pdfInputRef.current?.click();
  };

  const onPickPdf = async (file?: File | null) => {
    if (!file) return;

    try {
      uiStore.setUploadingPdf(true);

      const pdfUrl = await uploadFileWeb(file);
      if (!pdfUrl) return;

      const updatedPdfs = [
        ...(userProfileStore.medicalHistoryPdfs || []),
        pdfUrl,
      ];
      userProfileStore.setMedicalHistoryPdfs(updatedPdfs);

      const profileData = {
        profilePicture: userProfileStore.profilePicture,
        age: userProfileStore.age ? parseInt(userProfileStore.age) : undefined,
        gender: userProfileStore.gender.toLowerCase(),
        medicalHistory: userProfileStore.medicalHistory,
        medicalHistoryPdfs: updatedPdfs,
        address: {
          address: userProfileStore.address,
          pinCode: userProfileStore.pinCode,
          latitude: null,
          longitude: null,
        } as Address,
        city: userProfileStore.city,
      };

      const success = await userProfileApi.updateDataSilent(profileData);
      if (success) {
        userProfileStore.setSavedValues({
          ...userProfileStore.savedValues,
          medicalHistoryPdfs: updatedPdfs,
        });
        alert("Medical history PDF uploaded successfully.");
      } else {
        alert("PDF uploaded but failed to save. Please try saving manually.");
      }
    } catch (e) {
      console.error("Error picking document:", e);
      alert("Failed to upload document");
    } finally {
      uiStore.setUploadingPdf(false);
    }
  };

  const handleDocumentDelete = async (index: number) => {
    try {
      const updatedPdfs = userProfileStore.medicalHistoryPdfs.filter(
        (_, i) => i !== index,
      );
      userProfileStore.setMedicalHistoryPdfs(updatedPdfs);

      const profileData = {
        profilePicture: userProfileStore.profilePicture,
        age: userProfileStore.age ? parseInt(userProfileStore.age) : undefined,
        gender: userProfileStore.gender.toLowerCase(),
        medicalHistory: userProfileStore.medicalHistory,
        medicalHistoryPdfs: updatedPdfs,
        address: {
          address: userProfileStore.address,
          pinCode: userProfileStore.pinCode,
          latitude: null,
          longitude: null,
        } as Address,
        city: userProfileStore.city,
      };

      const success = await userProfileApi.updateDataSilent(profileData);
      if (success) {
        userProfileStore.setSavedValues({
          ...userProfileStore.savedValues,
          medicalHistoryPdfs: updatedPdfs,
        });
      } else {
        alert("Failed to save PDF deletion. Please try saving manually.");
      }
    } catch (e) {
      console.error("Error deleting PDF:", e);
      alert("Failed to delete PDF");
    }
  };

  // Doctor cover image
  const handleCoverImagePick = async () => {
    coverImageInputRef.current?.click();
  };

  const onPickCoverImage = async (file?: File | null) => {
    if (!file) return;

    try {
      uiStore.setUploadingCoverImage(true);
      const imageUrl = await uploadFileWeb(file);
      if (!imageUrl) return;
      doctorProfileStore.setCoverImage(imageUrl);
    } catch (e) {
      console.error("Error uploading cover image:", e);
      alert("Failed to upload cover image");
    } finally {
      uiStore.setUploadingCoverImage(false);
      uiStore.setShowImageOptions(false);
    }
  };

  // Lab service cover image pick (kept same “activeServiceId” flow)
  const handleServiceCoverImagePick = async (serviceId: string) => {
    setActiveServiceId(serviceId);
    uiStore.setUploadingCoverImage(true);
    // pick cover image file
    coverImageInputRef.current?.click();
  };

  // Saving logic (unchanged)
  const handleUpdateUserProfile = async () => {
    try {
      uiStore.setUpdating(true);
      const profileData = {
        profilePicture: userProfileStore.profilePicture,
        age: userProfileStore.age ? parseInt(userProfileStore.age) : undefined,
        gender: userProfileStore.gender.toLowerCase(),
        medicalHistory: userProfileStore.medicalHistory,
        medicalHistoryPdfs: userProfileStore.medicalHistoryPdfs,
        address: {
          address: userProfileStore.address,
          pinCode: userProfileStore.pinCode,
          latitude: null,
          longitude: null,
        } as Address,
        city: userProfileStore.city,
      };

      const response = await userProfileApi.updateData(profileData);
      if (response) {
        alert("Profile updated successfully");
        userProfileStore.setSavedValues({
          age: userProfileStore.age,
          gender: userProfileStore.gender,
          medicalHistory: userProfileStore.medicalHistory,
          address: userProfileStore.address,
          pinCode: userProfileStore.pinCode,
          city: userProfileStore.city,
          medicalHistoryPdfs: userProfileStore.medicalHistoryPdfs,
        });
      }
    } catch (e) {
      console.error("Error updating profile:", e);
      alert("Failed to update profile");
    } finally {
      uiStore.setUpdating(false);
    }
  };

  const hasDoctorProfileChanges = () => {
    const s = doctorProfileStore;
    const { savedValues } = doctorProfileStore;

    const isSpecializationsChanged =
      JSON.stringify(s.specializations) !==
      JSON.stringify(savedValues.specializations);
    const isQualificationsChanged =
      JSON.stringify(s.qualifications) !==
      JSON.stringify(savedValues.qualifications);
    const isAvailableDaysChanged =
      JSON.stringify(s.availableDays) !==
      JSON.stringify(savedValues.availableDays);
    const isAvailableSlotsChanged =
      JSON.stringify(s.availableSlots) !==
      JSON.stringify(savedValues.availableSlots);
    const isClinicsChanged =
      JSON.stringify(s.clinics) !== JSON.stringify(savedValues.clinics);

    return (
      s.description !== savedValues.description ||
      s.experience !== savedValues.experience ||
      isSpecializationsChanged ||
      isQualificationsChanged ||
      s.consultationFee !== savedValues.consultationFee ||
      s.age !== savedValues.age ||
      s.gender !== savedValues.gender ||
      s.isAvailable !== savedValues.isAvailable ||
      s.consultationType !== savedValues.consultationType ||
      s.coverImage !== savedValues.coverImage ||
      s.registrationNumber !== savedValues.registrationNumber ||
      isClinicsChanged ||
      isAvailableDaysChanged ||
      isAvailableSlotsChanged
    );
  };

  const handleUpdateDoctorProfile = async () => {
    try {
      uiStore.setUpdating(true);
      const profileData = doctorProfileStore.prepareProfileData();
      const response = await doctorProfileApi.updateData(profileData);

      if (response) {
        alert("Doctor profile updated successfully");
        doctorProfileStore.setSavedValues({
          description: doctorProfileStore.description,
          experience: doctorProfileStore.experience,
          specializations: doctorProfileStore.specializations,
          qualifications: doctorProfileStore.qualifications,
          consultationFee: doctorProfileStore.consultationFee,
          age: doctorProfileStore.age,
          gender: doctorProfileStore.gender,
          consultationType: doctorProfileStore.consultationType,
          isAvailable: doctorProfileStore.isAvailable,
          availableDays: doctorProfileStore.availableDays,
          availableSlots: doctorProfileStore.availableSlots,
          coverImage: doctorProfileStore.coverImage,
          registrationNumber: doctorProfileStore.registrationNumber,
          clinics: doctorProfileStore.clinics,
        });
      }
    } catch (e) {
      console.error("Error updating doctor profile:", e);
      alert("Failed to update doctor profile");
    } finally {
      uiStore.setUpdating(false);
    }
  };

  const handleUpdateLaboratoryProfile = async () => {
    try {
      uiStore.setUpdating(true);
      const profileData = laboratoryProfileStore.prepareProfileData();
      const response = await laboratoryProfileApi.updateData(profileData);

      if (response) {
        alert("Laboratory profile updated successfully");
        laboratoryProfileStore.setSavedValues({
          laboratoryName: laboratoryProfileStore.laboratoryName,
          laboratoryPhone: laboratoryProfileStore.laboratoryPhone,
          laboratoryEmail: laboratoryProfileStore.laboratoryEmail,
          laboratoryWebsite: laboratoryProfileStore.laboratoryWebsite,
          laboratoryAddress: laboratoryProfileStore.laboratoryAddress,
          laboratoryPinCode: laboratoryProfileStore.laboratoryPinCode,
          laboratoryCity: laboratoryProfileStore.laboratoryCity,
          laboratoryGoogleMapsLink:
            laboratoryProfileStore.laboratoryGoogleMapsLink,
          laboratoryServices: laboratoryProfileStore.laboratoryServices,
          coverImage: laboratoryProfileStore.coverImage,
          isAvailable: laboratoryProfileStore.isAvailable,
          availableDays: laboratoryProfileStore.availableDays,
          availableSlots: laboratoryProfileStore.availableSlots,
        });
      }
    } catch (e) {
      console.error("Error updating laboratory profile:", e);
      alert("Failed to update laboratory profile");
    } finally {
      uiStore.setUpdating(false);
    }
  };

  const hasUserProfileChanges = () => {
    const {
      age,
      gender,
      medicalHistory,
      address,
      pinCode,
      city,
      medicalHistoryPdfs,
    } = userProfileStore;
    const { savedValues } = userProfileStore;

    return (
      age !== savedValues.age ||
      gender !== savedValues.gender ||
      medicalHistory !== savedValues.medicalHistory ||
      address !== savedValues.address ||
      pinCode !== savedValues.pinCode ||
      city !== savedValues.city ||
      medicalHistoryPdfs !== savedValues.medicalHistoryPdfs
    );
  };

  const hasChanges = () => {
    if (!user) return false;

    if (user.role === UserRole.USER || user.role === UserRole.DELIVERY_BOY)
      return hasUserProfileChanges();
    if (user.role === UserRole.DOCTOR) return hasDoctorProfileChanges();
    if (user.role === UserRole.LABORATORY) {
      return (
        laboratoryProfileStore.laboratoryName !==
          laboratoryProfileStore.savedValues.laboratoryName ||
        laboratoryProfileStore.laboratoryPhone !==
          laboratoryProfileStore.savedValues.laboratoryPhone ||
        laboratoryProfileStore.laboratoryEmail !==
          laboratoryProfileStore.savedValues.laboratoryEmail ||
        laboratoryProfileStore.laboratoryWebsite !==
          laboratoryProfileStore.savedValues.laboratoryWebsite ||
        laboratoryProfileStore.laboratoryAddress !==
          laboratoryProfileStore.savedValues.laboratoryAddress ||
        laboratoryProfileStore.laboratoryPinCode !==
          laboratoryProfileStore.savedValues.laboratoryPinCode ||
        laboratoryProfileStore.laboratoryCity !==
          laboratoryProfileStore.savedValues.laboratoryCity ||
        laboratoryProfileStore.laboratoryGoogleMapsLink !==
          laboratoryProfileStore.savedValues.laboratoryGoogleMapsLink ||
        JSON.stringify(laboratoryProfileStore.laboratoryServices) !==
          JSON.stringify(laboratoryProfileStore.savedValues.laboratoryServices)
      );
    }
    return false;
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    if (user.role === UserRole.USER || user.role === UserRole.DELIVERY_BOY) {
      await handleUpdateUserProfile();
    } else if (user.role === UserRole.DOCTOR) {
      await handleUpdateDoctorProfile();
    } else if (user.role === UserRole.LABORATORY) {
      await handleUpdateLaboratoryProfile();
    }
  };

  // Immediate-save handlers (same logic)
  const handleGenderChange = async (newGender: string) => {
    try {
      userProfileStore.setGender(newGender);

      const profileData = {
        profilePicture: userProfileStore.profilePicture,
        age: userProfileStore.age ? parseInt(userProfileStore.age) : undefined,
        gender: newGender.toLowerCase(),
        medicalHistory: userProfileStore.medicalHistory,
        medicalHistoryPdfs: userProfileStore.medicalHistoryPdfs,
        address: {
          address: userProfileStore.address,
          pinCode: userProfileStore.pinCode,
          latitude: null,
          longitude: null,
        } as Address,
        city: userProfileStore.city,
      };

      const success = await userProfileApi.updateDataSilent(profileData);
      if (success) {
        userProfileStore.setSavedValues({
          ...userProfileStore.savedValues,
          gender: newGender,
        });
      }
    } catch (e) {
      console.error("Error auto-saving gender:", e);
    }
  };

  const handleCityChange = async (newCity: string) => {
    try {
      userProfileStore.setCity(newCity);

      const profileData = {
        profilePicture: userProfileStore.profilePicture,
        age: userProfileStore.age ? parseInt(userProfileStore.age) : undefined,
        gender: userProfileStore.gender.toLowerCase(),
        medicalHistory: userProfileStore.medicalHistory,
        medicalHistoryPdfs: userProfileStore.medicalHistoryPdfs,
        address: {
          address: userProfileStore.address,
          pinCode: userProfileStore.pinCode,
          latitude: null,
          longitude: null,
        } as Address,
        city: newCity,
      };

      const success = await userProfileApi.updateDataSilent(profileData);
      if (success) {
        userProfileStore.setSavedValues({
          ...userProfileStore.savedValues,
          city: newCity,
        });
      }
    } catch (e) {
      console.error("Error auto-saving city:", e);
    }
  };

  const handleDoctorIsAvailableChange = async (newIsAvailable: boolean) => {
    try {
      doctorProfileStore.setIsAvailable(newIsAvailable);
      const profileData = doctorProfileStore.prepareProfileData();
      profileData.isAvailable = newIsAvailable;

      const success = await doctorProfileApi.updateDataSilent(profileData);
      if (success) {
        doctorProfileStore.setSavedValues({
          ...doctorProfileStore.savedValues,
          isAvailable: newIsAvailable,
        });
      }
    } catch (e) {
      console.error("Error auto-saving doctor availability:", e);
    }
  };

  const handleDoctorAvailableDayToggle = async (day: string) => {
    try {
      doctorProfileStore.toggleAvailableDay(day);
      const updatedDays = [...doctorProfileStore.availableDays];

      const profileData = doctorProfileStore.prepareProfileData();
      profileData.availableDays = updatedDays;

      const success = await doctorProfileApi.updateDataSilent(profileData);
      if (success) {
        doctorProfileStore.setSavedValues({
          ...doctorProfileStore.savedValues,
          availableDays: updatedDays,
        });
      }
    } catch (e) {
      console.error("Error auto-saving doctor available days:", e);
    }
  };

  const handleDoctorAvailableSlotAdd = async (slot: string) => {
    try {
      doctorProfileStore.addAvailableSlot(slot);
      const updatedSlots = [...doctorProfileStore.availableSlots];

      const profileData = doctorProfileStore.prepareProfileData();
      profileData.availableSlots = updatedSlots;

      const success = await doctorProfileApi.updateDataSilent(profileData);
      if (success) {
        doctorProfileStore.setSavedValues({
          ...doctorProfileStore.savedValues,
          availableSlots: updatedSlots,
        });
      }
    } catch (e) {
      console.error("Error auto-saving doctor slots add:", e);
    }
  };

  const handleDoctorAvailableSlotRemove = async (slot: string) => {
    try {
      doctorProfileStore.removeAvailableSlot(slot);
      const updatedSlots = doctorProfileStore.availableSlots.filter(
        (s) => s !== slot,
      );

      const profileData = doctorProfileStore.prepareProfileData();
      profileData.availableSlots = updatedSlots;

      const success = await doctorProfileApi.updateDataSilent(profileData);
      if (success) {
        doctorProfileStore.setSavedValues({
          ...doctorProfileStore.savedValues,
          availableSlots: updatedSlots,
        });
      }
    } catch (e) {
      console.error("Error auto-saving doctor slots remove:", e);
    }
  };

  const handleDoctorGenderChange = async (newGender: string) => {
    try {
      doctorProfileStore.setGender(newGender);
      const profileData = doctorProfileStore.prepareProfileData();
      profileData.gender = newGender.toLowerCase();

      const success = await doctorProfileApi.updateDataSilent(profileData);
      if (success) {
        doctorProfileStore.setSavedValues({
          ...doctorProfileStore.savedValues,
          gender: newGender,
        });
      }
    } catch (e) {
      console.error("Error auto-saving doctor gender:", e);
    }
  };

  const handleDoctorConsultationTypeChange = async (newType: string) => {
    try {
      doctorProfileStore.setConsultationType(newType);
      const profileData = doctorProfileStore.prepareProfileData();
      profileData.consultationType = newType;

      const success = await doctorProfileApi.updateDataSilent(profileData);
      if (success) {
        doctorProfileStore.setSavedValues({
          ...doctorProfileStore.savedValues,
          consultationType: newType,
        });
      }
    } catch (e) {
      console.error("Error auto-saving consultation type:", e);
    }
  };

  const renderProfileForm = () => {
    if (!user) return null;

    switch (user.role) {
      case UserRole.USER:
      case UserRole.DELIVERY_BOY:
        return (
          <UserProfileForm
            age={userProfileStore.age}
            gender={userProfileStore.gender}
            address={userProfileStore.address}
            pinCode={userProfileStore.pinCode}
            city={userProfileStore.city}
            medicalHistory={userProfileStore.medicalHistory}
            medicalHistoryPdfs={userProfileStore.medicalHistoryPdfs}
            uploadingPdf={uiStore.uploadingPdf}
            cities={uiStore.cities}
            userRole={user.role}
            onChangeAge={(text: string) => userProfileStore.setAge(text)}
            onChangeGender={handleGenderChange}
            onChangeAddress={(text: string) =>
              userProfileStore.setAddress(text)
            }
            onChangePinCode={(text: string) =>
              userProfileStore.setPinCode(
                text.replace(/\D/g, "").substring(0, 6),
              )
            }
            onChangeCity={handleCityChange}
            onChangeMedicalHistory={(text: string) =>
              userProfileStore.setMedicalHistory(text)
            }
            onDocumentPick={handleDocumentPick}
            onDocumentDelete={handleDocumentDelete}
            savedValues={userProfileStore.savedValues}
          />
        );

      case UserRole.DOCTOR:
        return (
          <DoctorProfileForm
            description={doctorProfileStore.description}
            experience={doctorProfileStore.experience}
            specializations={doctorProfileStore.specializations}
            availableSpecializations={
              doctorProfileStore.availableSpecializations
            }
            qualifications={doctorProfileStore.qualifications}
            availableQualifications={doctorProfileStore.availableQualifications}
            consultationFee={doctorProfileStore.consultationFee}
            age={doctorProfileStore.age}
            gender={doctorProfileStore.gender}
            consultationType={doctorProfileStore.consultationType}
            coverImage={doctorProfileStore.coverImage}
            registrationNumber={doctorProfileStore.registrationNumber}
            clinics={doctorProfileStore.clinics}
            cities={uiStore.cities}
            isAvailable={doctorProfileStore.isAvailable}
            availableDays={doctorProfileStore.availableDays}
            availableSlots={doctorProfileStore.availableSlots}
            uploadingCoverImage={uiStore.uploadingCoverImage}
            onChangeDescription={(t: string) =>
              doctorProfileStore.setDescription(t)
            }
            onChangeExperience={(t: string) =>
              doctorProfileStore.setExperience(t)
            }
            onAddSpecialization={(spec: string) =>
              doctorProfileStore.addSpecialization(spec)
            }
            onRemoveSpecialization={(index: number) =>
              doctorProfileStore.removeSpecialization(index)
            }
            onAddQualification={(qual: string) =>
              doctorProfileStore.addQualification(qual)
            }
            onRemoveQualification={(index: number) =>
              doctorProfileStore.removeQualification(index)
            }
            onChangeConsultationFee={(fee: string) =>
              doctorProfileStore.setConsultationFee(fee)
            }
            onChangeAge={(age: string) => doctorProfileStore.setAge(age)}
            onChangeGender={handleDoctorGenderChange}
            onChangeConsultationType={handleDoctorConsultationTypeChange}
            onChangeCoverImage={handleCoverImagePick}
            onChangeRegistrationNumber={(t: string) =>
              doctorProfileStore.setRegistrationNumber(t)
            }
            onAddClinic={() => doctorProfileStore.addClinic()}
            onRemoveClinic={(index: number) =>
              doctorProfileStore.removeClinic(index)
            }
            onChangeClinicName={(t: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicName", t)
            }
            onChangeClinicPhone={(t: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicPhone", t)
            }
            onChangeClinicEmail={(t: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicEmail", t)
            }
            onChangeClinicWebsite={(t: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicWebsite", t)
            }
            onChangeClinicAddress={(t: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicAddress", t)
            }
            onChangeClinicPinCode={(t: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicPinCode", t)
            }
            onChangeClinicCity={(city: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicCity", city)
            }
            onChangeClinicGoogleMapsLink={(t: string, i: number) =>
              doctorProfileStore.updateClinic(i, "clinicGoogleMapsLink", t)
            }
            onChangeIsAvailable={handleDoctorIsAvailableChange}
            onToggleAvailableDay={handleDoctorAvailableDayToggle}
            onAddAvailableSlot={handleDoctorAvailableSlotAdd}
            onRemoveAvailableSlot={handleDoctorAvailableSlotRemove}
            savedValues={doctorProfileStore.savedValues}
          />
        );

      case UserRole.LABORATORY:
        return (
          <LaboratoryProfileForm
            availableCategories={uiStore.labServiceCategories}
            onServiceCoverImagePick={handleServiceCoverImagePick}
          />
        );

      default:
        return (
          <div className="bg-yellow-50 p-4 rounded-xl mb-6">
            <p className="text-yellow-700 text-center">
              Profile settings for your role are not yet available.
            </p>
          </div>
        );
    }
  };

  if (uiStore.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-500" />
          <p className="mt-4 text-gray-500">Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* hidden inputs */}
      <input
        ref={profileImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickProfileImage(e.target.files?.[0] ?? null)}
      />
      <input
        ref={coverImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickCoverImage(e.target.files?.[0] ?? null)}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onPickPdf(e.target.files?.[0] ?? null)}
      />

      <div>
        {/* Header Section */}
        <ProfileHeader
          userData={user} 
          onProfilePicturePress={handleProfilePicturePress}
          setIsEditingBasicInfo={setIsEditingBasicInfo}
        />

        <AnimatedModal
          open={isEditingBasicInfo}
          onClose={() => setIsEditingBasicInfo(false)}
          maxWidth="max-w-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Edit Basic Info
            </h3>

            <button
              type="button"
              onClick={() => setIsEditingBasicInfo(false)}
              className="rounded-lg bg-red-50 p-2 transition hover:bg-red-100 cursor-pointer"
              aria-label="Close"
            >
              <IoCloseCircleOutline size={24} color="#EF4444" />
            </button>
          </div>

          {/* Body */}
          <div className="py-4">
            <div className="mb-4">
              <p className="text-gray-700 font-medium mb-2">Name</p>
              <input
                value={basicInfo.name}
                onChange={(e) =>
                  setBasicInfo((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Enter your name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mb-4">
              <p className="text-gray-700 font-medium mb-2">Email</p>
              <input
                value={basicInfo.email}
                onChange={(e) =>
                  setBasicInfo((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="Enter your email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="mb-6">
              <p className="text-gray-700 font-medium mb-2">Phone</p>
              <input
                value={basicInfo.phone}
                onChange={(e) =>
                  setBasicInfo((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="Enter your phone number"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={handleUpdateBasicInfo}
              disabled={uiStore.updating}
              className="w-full flex items-center justify-center px-4 py-2 text-white bg-[#5570F1] rounded-xl cursor-pointer hover:bg-[#5570F1]/85 duration-300 transition-all text-base flex-1"
            >
              {uiStore.updating ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </AnimatedModal>

        <div className="grid lg:grid-cols-12 grid-cols-1 gap-8">
          {/* Dynamic role-based form */}
          <div className="lg:col-span-8 col-span-full">
            {renderProfileForm()}
          </div>
          {/* Danger zone */}
          <div className="lg:col-span-4 col-span-full">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-semibold text-lg mb-2">
                Danger Zone
              </p>
              <p className="text-red-700 text-sm mb-4">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                onClick={() => setShowDeleteAccountModal(true)}
                className="bg-red-600 duration-300 hover:bg-red-300 rounded-xl py-3 px-4 flex items-center justify-center text-white font-medium cursor-pointer"
              >
                <IoTrash size={20} color="white" />
                <span className="ml-2">Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*Save Button */}
      {(user?.role === UserRole.USER ||
        user?.role === UserRole.DELIVERY_BOY ||
        user?.role === UserRole.DOCTOR ||
        user?.role === UserRole.LABORATORY) &&
        hasChanges() && (
          <SaveButton onPress={handleSaveChanges} loading={uiStore.updating} />
        )}

      {/* Image picker modal (web: triggers file dialog) */}
      <ImagePickerModal
        visible={uiStore.showImageOptions}
        onClose={() => uiStore.setShowImageOptions(false)}
        onChooseFromGallery={openGallery}
      />

      <DeleteAccountModal
        visible={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
      />
    </div>
  );
};

export default Profile;
