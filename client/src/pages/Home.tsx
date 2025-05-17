import { useState, useEffect } from "react";
import StepIndicator from "../components/StepIndicator";
import FileUpload from "../components/FileUpload";
import PreviewCard from "../components/PreviewCard";
import ModelViewer from "../components/ModelViewer";
import { useTranslation } from "../lib/i18n";
import { useStep } from "../providers/StepProvider";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  gender: z.enum(["male", "female"], {
    required_error: "Please select gender",
  }),
  promptText: z.string().optional(),
});

const orderFormSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().min(3, {
    message: "Please enter an email address.",
  }),
  phone: z.string()
    .min(6, { message: "Phone number is too short." })
    .max(20, { message: "Phone number is too long." })
    .regex(/^[0-9+\- ]*$/, {
      message: "Phone can only contain numbers, +, - and spaces.",
    }),
});

const Home = () => {
  const { t } = useTranslation();
  const { step, setStep } = useStep();
  const { toast } = useToast();
  
  // State for the upload step
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadId, setUploadId] = useState<number | null>(null);
  
  // State for the preview step
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [promptText, setPromptText] = useState<string>("");
  const [analysisText, setAnalysisText] = useState<string>("");
  
  // State for 3D model
  const [modelData, setModelData] = useState<string | null>(null);
  
  // Setup form for step 1
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gender: "female", // По умолчанию выбран женский пол
      promptText: "",
    },
  });
  
  // Setup form for step 4 (order)
  const orderForm = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });
  
  // Handle file selection and upload to server
  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    
    // Create a preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload file to server
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.id) {
        setUploadId(data.id);
        console.log('File uploaded successfully, ID:', data.id);
      } else {
        toast({
          title: t("errors.uploadFailed"),
          description: t("errors.tryAgain"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: t("errors.uploadFailed"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };
  
  // Handle step 1 form submission
  const onSubmitStep1 = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFile) {
      toast({
        title: t("errors.noFile"),
        description: t("errors.pleaseUpload"),
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadId) {
      toast({
        title: t("errors.uploadFailed"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
      return;
    }
    
    // Move to preview step
    setPromptText(values.promptText || "");
    setStep(1);
    
    // Generate preview using OpenAI
    setIsGenerating(true);
    generatePreview(values.promptText || "");
  };
  
  // Generate preview using OpenAI API
  const generatePreview = async (customPrompt: string) => {
    try {
      const response = await fetch('/api/generate-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: uploadId,
          customPrompt: `${form.getValues().gender === "male" ? "MALE CHARACTER," : "FEMALE CHARACTER,"} ${customPrompt}`,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsGenerating(false);
        setGeneratedPreview(data.avatarUrl);
        setOriginalImage(data.originalImage);
        setAnalysisText(data.analysis || "");
        
        console.log('Generated preview:', data);
      } else {
        setIsGenerating(false);
        toast({
          title: t("errors.generationFailed"),
          description: data.error || t("errors.tryAgain"),
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsGenerating(false);
      console.error('Error generating preview:', error);
      toast({
        title: t("errors.generationFailed"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };
  
  // Handle regenerate preview click
  const handleRegenerateClick = () => {
    if (!uploadId) {
      toast({
        title: t("errors.uploadFailed"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    generatePreview(promptText);
  };
  
  // Handle confirm preview click
  const handleConfirmPreview = () => {
    setStep(2); // Move to order form step
  };
  
  // Check if all form fields are valid and filled
  const isOrderFormValid = () => {
    const { errors, isDirty, touchedFields } = orderForm.formState;
    const formValues = orderForm.getValues();
    
    // Проверяем, что все поля заполнены и прошли валидацию
    const allFieldsTouched = Object.keys(orderFormSchema.shape).every(
      key => touchedFields[key as keyof typeof touchedFields]
    );
    
    // Проверяем, что email содержит символ @
    const isEmailValid = (formValues.email || "").includes('@');
    
    // Проверяем, что номер телефона содержит только цифры, +, - и пробелы
    const phoneRegex = /^[0-9+\- ]*$/;
    const isPhoneValid = phoneRegex.test(formValues.phone || "") && 
                        (formValues.phone?.length || 0) >= 6;
    
    return isDirty && 
           allFieldsTouched && 
           Object.keys(errors).length === 0 &&
           isEmailValid && 
           isPhoneValid;
  };

  // Handle continue to 3D model click
  const handleContinueToModel = () => {
    if (!isOrderFormValid()) {
      // Trigger validation to show error messages
      orderForm.trigger();
      return;
    }
    setStep(3); // Move to 3D model preview step
  };
  
  // Handle order submission
  const onSubmitOrder = async (values: z.infer<typeof orderFormSchema>) => {
    try {
      // Simulate API call
      toast({
        title: t("order.success"),
        description: t("order.emailSent"),
      });
      
      // Reset to step 1 for a new order
      setTimeout(() => {
        setStep(0);
        setSelectedFile(null);
        setFilePreview(null);
        setGeneratedPreview(null);
        form.reset();
        orderForm.reset();
      }, 3000);
    } catch (error) {
      toast({
        title: t("errors.orderFailed"),
        description: t("errors.tryAgain"),
        variant: "destructive",
      });
    }
  };
  
  // Go back to the previous step
  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <main className="relative z-10 px-4 md:px-0 max-w-6xl mx-auto pb-20">
      {/* Header section */}
      <div className="text-center pt-8 pb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-accent">{t("home.title")}</h1>
        <p className="text-foreground max-w-2xl mx-auto font-medium">
          {t("home.subtitle")}
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Step 1: Upload Photo */}
      {step === 0 && (
        <div className="bg-space-deep/80 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">{t("steps.step1")}</h2>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-6">

              
              {/* Gender selection */}
              <div className="bg-gradient-to-r from-[hsl(var(--space-nebula)_/_0.15)] to-transparent p-5 rounded-lg border border-accent/20 mb-5">
                <h3 className="text-base font-medium mb-3 text-accent/90 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8v8"></path>
                    <path d="M8 12h8"></path>
                  </svg>
                  {t("upload.chooseGender")}
                </h3>
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormControl>
                        <div className="flex gap-3">
                          <div
                            className={`flex-1 p-4 rounded-md border border-accent/30 cursor-pointer transition-all ${
                              field.value === "male" ? "bg-accent/20 border-accent" : "hover:bg-background/50"
                            }`}
                            onClick={() => field.onChange("male")}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="10" r="7"></circle>
                                <path d="M12 17v7"></path>
                                <path d="M7 22h10"></path>
                              </svg>
                              <span className="font-medium">{t("upload.male")}</span>
                            </div>
                          </div>
                          
                          <div
                            className={`flex-1 p-4 rounded-md border border-accent/30 cursor-pointer transition-all ${
                              field.value === "female" ? "bg-accent/20 border-accent" : "hover:bg-background/50"
                            }`}
                            onClick={() => field.onChange("female")}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="10" r="7"></circle>
                                <path d="M9 17h6"></path>
                                <path d="M12 17v7"></path>
                              </svg>
                              <span className="font-medium">{t("upload.female")}</span>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* File upload area */}
              <FileUpload onFileSelected={handleFileSelected} />
              
              {/* Optional settings (after file upload) */}
              <div className="mt-8">
                <div className="bg-gradient-to-r from-[hsl(var(--space-nebula)_/_0.15)] to-transparent p-5 rounded-lg border border-accent/20">
                  <FormField
                    control={form.control}
                    name="promptText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-sm font-medium text-accent/90 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                          {t("upload.additionalSettings")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("upload.promptPlaceholder")}
                            className="bg-background border border-gray-700 text-foreground placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all rounded-md"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Navigation buttons */}
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  className="bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600 text-white/50 font-medium py-2.5 px-8 rounded-full opacity-50 cursor-not-allowed mr-4 shadow-md transition-all flex items-center"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  {t("navigation.back")}
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center"
                >
                  {t("navigation.generatePreview")}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 1 && (
        <div className="bg-space-deep/80 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">{t("steps.step2")}</h2>
          
          <PreviewCard
            originalImage={originalImage || filePreview}
            previewImage={generatedPreview}
            isLoading={isGenerating}
            promptValue={promptText}
            analysisText={analysisText}
            onPromptChange={setPromptText}
            onRegenerateClick={handleRegenerateClick}
            onConfirmClick={handleConfirmPreview}
          />
          
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              className="bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600 text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center"
              onClick={handleBack}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t("navigation.back")}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Order Form */}
      {step === 2 && (
        <div className="bg-space-deep/80 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">{t("steps.step3")}</h2>
          
          <Form {...orderForm}>
            <form onSubmit={orderForm.handleSubmit(onSubmitOrder)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={orderForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-400">
                        {t("order.firstName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("order.firstNamePlaceholder")}
                          className="bg-background border border-gray-700 text-foreground placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-400">
                        {t("order.lastName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("order.lastNamePlaceholder")}
                          className="bg-background border border-gray-700 text-foreground placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-400">
                        {t("order.email")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("order.emailPlaceholder")}
                          className="bg-background border border-gray-700 text-foreground placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={orderForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-400">
                        {t("order.phone")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("order.phonePlaceholder")}
                          className="bg-background border border-gray-700 text-foreground placeholder-gray-500 focus:border-accent focus:ring-1 focus:ring-accent/50 transition-all rounded-md"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  className="bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600 text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center"
                  onClick={handleBack}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  {t("navigation.back")}
                </button>
                <button
                  type="button"
                  className={`${
                    isOrderFormValid() 
                    ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                    : "bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600"
                  } text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center`}
                  onClick={handleContinueToModel}
                  disabled={!isOrderFormValid()}
                >
                  {t("navigation.done")}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          </Form>
        </div>
      )}

      {/* Step 4: 3D Model Preview */}
      {step === 3 && (
        <div className="bg-space-deep/80 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">{t("steps.step4")}</h2>
          
          {/* 3D Model Viewer */}
          <ModelViewer modelUrl={modelData || undefined} />
          
          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              className="bg-gray-700/50 border border-gray-600/30 hover:bg-gray-600 text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center"
              onClick={handleBack}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              {t("navigation.back")}
            </button>
            <button
              type="button"
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-medium py-2.5 px-8 rounded-full shadow-md transition-all flex items-center"
              onClick={() => {
                // Simulate completing order with default form values
                onSubmitOrder(orderForm.getValues());
              }}
            >
              {t("navigation.completeOrder")}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;