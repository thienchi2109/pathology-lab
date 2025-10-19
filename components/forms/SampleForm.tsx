"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSheet } from "./FormSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { SaveStatusIndicator } from "@/components/ui/save-status-indicator";
import { useAutosave } from "@/lib/hooks/useAutosave";
import { sampleFormSchema, type SampleFormData, type KitType, type SampleType, type Category } from "@/lib/schemas";

interface SampleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  sampleId?: string; // For editing existing samples
}

export function SampleForm({
  open,
  onOpenChange,
  onSuccess,
  sampleId,
}: SampleFormProps) {
  const { addToast } = useToast();
  
  // Dictionary data
  const [kitTypes, setKitTypes] = useState<KitType[]>([]);
  const [sampleTypes, setSampleTypes] = useState<SampleType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingDicts, setLoadingDicts] = useState(true);
  const [loadingSample, setLoadingSample] = useState(false);
  
  // React Hook Form with Zod validation
  const form = useForm<SampleFormData>({
    resolver: zodResolver(sampleFormSchema),
    defaultValues: {
      assignNext: true,
      kit_id: "",
      kit_type_id: "",
      customer: "",
      sample_type: "",
      received_at: new Date().toISOString().split('T')[0],
      collected_at: "",
      technician: "",
      price: "",
      status: 'draft',
      billing_status: 'unpaid',
      invoice_month: "",
      category_id: "",
      company_name: "",
      company_region: "",
      company_province: "",
      customer_name: "",
      customer_phone: "",
      customer_region: "",
      sl_mau: "1",
      note: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, clearErrors } = form;

  // Autosave draft functionality
  const handleAutosave = useCallback(async (data: SampleFormData) => {
    // Only autosave if we have a sampleId (editing existing draft)
    if (!sampleId) {
      return;
    }

    try {
      const payload = {
        customer: data.customer?.trim() || '',
        sample_type: data.sample_type?.trim() || '',
        received_at: data.received_at,
        collected_at: data.collected_at || null,
        technician: data.technician?.trim() || '',
        price: data.price ? parseFloat(data.price) : 0,
        status: 'draft', // Always save as draft during autosave
        billing_status: data.billing_status,
        invoice_month: data.invoice_month || null,
        category_id: data.category_id,
        company_snapshot: {
          name: data.company_name?.trim() || '',
          region: data.company_region?.trim() || undefined,
          province: data.company_province?.trim() || undefined,
        },
        customer_snapshot: {
          name: data.customer_name?.trim() || '',
          phone: data.customer_phone?.trim() || undefined,
          region: data.customer_region?.trim() || undefined,
        },
        sl_mau: data.sl_mau ? parseInt(data.sl_mau) : 1,
        note: data.note?.trim() || null,
      };

      await fetch(`/api/samples/${sampleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('[Autosave] Failed to save draft:', error);
      throw error;
    }
  }, [sampleId]);

  const { saveStatus, lastSaved, saveNow } = useAutosave({
    watch,
    onSave: handleAutosave,
    interval: 30000, // 30 seconds
    enabled: !!sampleId && open, // Only enable autosave when editing existing sample
  });

  // Load existing sample data when editing
  useEffect(() => {
    async function loadSample() {
      if (!sampleId || !open) return;

      setLoadingSample(true);
      try {
        const response = await fetch(`/api/samples/${sampleId}`);
        if (!response.ok) {
          throw new Error('Failed to load sample');
        }

        const result = await response.json();
        const sample = result.data;

        // Populate form with existing data
        reset({
          assignNext: false,
          kit_id: sample.kit_id,
          kit_type_id: '',
          customer: sample.customer,
          sample_type: sample.sample_type,
          received_at: sample.received_at,
          collected_at: sample.collected_at || '',
          technician: sample.technician,
          price: sample.price.toString(),
          status: sample.status,
          billing_status: sample.billing_status,
          invoice_month: sample.invoice_month ? sample.invoice_month.substring(0, 7) : '',
          category_id: sample.category_id,
          company_name: sample.company_snapshot?.name || '',
          company_region: sample.company_snapshot?.region || '',
          company_province: sample.company_snapshot?.province || '',
          customer_name: sample.customer_snapshot?.name || '',
          customer_phone: sample.customer_snapshot?.phone || '',
          customer_region: sample.customer_snapshot?.region || '',
          sl_mau: sample.sl_mau.toString(),
          note: sample.note || '',
        });
      } catch (error) {
        console.error('Error loading sample:', error);
        addToast({
          message: 'Không thể tải dữ liệu mẫu',
          variant: 'error',
        });
      } finally {
        setLoadingSample(false);
      }
    }

    loadSample();
  }, [sampleId, open, reset, addToast]);

  // Load dictionary data on mount
  useEffect(() => {
    async function loadDictionaries() {
      if (!open) return;
      
      try {
        const [kitTypesRes, sampleTypesRes, categoriesRes] = await Promise.all([
          fetch("/api/dicts/kit-types"),
          fetch("/api/dicts/sample-types"),
          fetch("/api/dicts/categories"),
        ]);

        if (kitTypesRes.ok) {
          const result = await kitTypesRes.json();
          setKitTypes(result.data || []);
        }

        if (sampleTypesRes.ok) {
          const result = await sampleTypesRes.json();
          setSampleTypes(result.data || []);
        }

        if (categoriesRes.ok) {
          const result = await categoriesRes.json();
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error("Error loading dictionaries:", error);
        addToast({
          message: "Không thể tải dữ liệu danh mục",
          variant: "error",
        });
      } finally {
        setLoadingDicts(false);
      }
    }

    loadDictionaries();
  }, [open, addToast]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      reset();
      setLoadingDicts(true);
    }
  }, [open, reset]);

  // Watch form values for conditional validation
  const watchAssignNext = watch("assignNext");
  const watchBillingStatus = watch("billing_status");

  const onSubmit = async (data: SampleFormData) => {
    setLoading(true);

    try {
      if (sampleId) {
        // Update existing sample
        const payload = {
          customer: data.customer.trim(),
          sample_type: data.sample_type.trim(),
          received_at: data.received_at,
          collected_at: data.collected_at || null,
          technician: data.technician.trim(),
          price: parseFloat(data.price),
          status: data.status,
          billing_status: data.billing_status,
          invoice_month: data.invoice_month || null,
          category_id: data.category_id,
          company_snapshot: {
            name: data.company_name.trim(),
            region: data.company_region?.trim() || undefined,
            province: data.company_province?.trim() || undefined,
          },
          customer_snapshot: {
            name: data.customer_name.trim(),
            phone: data.customer_phone?.trim() || undefined,
            region: data.customer_region?.trim() || undefined,
          },
          sl_mau: parseInt(data.sl_mau),
          note: data.note?.trim() || null,
        };

        const response = await fetch(`/api/samples/${sampleId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Đã xảy ra lỗi");
        }

        addToast({
          title: "Thành công",
          message: `Đã cập nhật mẫu ${result.data.sample_code}`,
          variant: "success",
        });
      } else {
        // Create new sample
        const payload = {
          assignNext: data.assignNext,
          kit_id: data.assignNext ? undefined : data.kit_id,
          kit_type_id: data.assignNext ? data.kit_type_id : undefined,
          customer: data.customer.trim(),
          sample_type: data.sample_type.trim(),
          received_at: data.received_at,
          collected_at: data.collected_at || null,
          technician: data.technician.trim(),
          price: parseFloat(data.price),
          status: data.status,
          billing_status: data.billing_status,
          invoice_month: data.invoice_month || null,
          category_id: data.category_id,
          company_snapshot: {
            name: data.company_name.trim(),
            region: data.company_region?.trim() || undefined,
            province: data.company_province?.trim() || undefined,
          },
          customer_snapshot: {
            name: data.customer_name.trim(),
            phone: data.customer_phone?.trim() || undefined,
            region: data.customer_region?.trim() || undefined,
          },
          sl_mau: parseInt(data.sl_mau),
          note: data.note?.trim() || null,
        };

        const response = await fetch("/api/samples", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Đã xảy ra lỗi");
        }

        addToast({
          title: "Thành công",
          message: `Đã tạo mẫu ${result.data.sample_code}`,
          variant: "success",
        });
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving sample:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể lưu mẫu";
      addToast({
        title: "Lỗi",
        message: errorMessage,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center justify-between gap-4">
          <span>{sampleId ? "Chỉnh sửa mẫu" : "Tạo mẫu mới"}</span>
          {sampleId && <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />}
        </div>
      }
      description="Nhập thông tin mẫu xét nghiệm"
    >
      {loadingSample ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-sm text-text-secondary">Đang tải dữ liệu...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Kit Selection */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary border-b pb-2">
            1. Chọn Kit
          </h3>

          {/* Auto-assign toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="assignNext"
              {...register("assignNext")}
              disabled={loading}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="assignNext" className="cursor-pointer">
              Tự động gán kit tiếp theo
            </Label>
          </div>

          {watchAssignNext ? (
            <div className="space-y-2">
              <Label htmlFor="kit_type_id">
                Loại kit <span className="text-error">*</span>
              </Label>
              <Select
                value={watch("kit_type_id")}
                onValueChange={(value) => {
                  setValue("kit_type_id", value);
                  clearErrors("kit_type_id");
                }}
                disabled={loading || loadingDicts}
              >
                <SelectTrigger id="kit_type_id">
                  <SelectValue placeholder="Chọn loại kit" />
                </SelectTrigger>
                <SelectContent>
                  {kitTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.kit_type_id && (
                <p className="text-sm text-error">{errors.kit_type_id.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="kit_id">
                Mã kit <span className="text-error">*</span>
              </Label>
              <Input
                id="kit_id"
                {...register("kit_id")}
                placeholder="Nhập mã kit"
                disabled={loading}
              />
              {errors.kit_id && (
                <p className="text-sm text-error">{errors.kit_id.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Basic Information */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary border-b pb-2">
            2. Thông tin cơ bản
          </h3>

          <div className="space-y-2">
            <Label htmlFor="customer">
              Khách hàng <span className="text-error">*</span>
            </Label>
            <Input
              id="customer"
              {...register("customer")}
              placeholder="Tên khách hàng"
              disabled={loading}
            />
            {errors.customer && (
              <p className="text-sm text-error">{errors.customer.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sample_type">
              Loại mẫu <span className="text-error">*</span>
            </Label>
            <Select
              value={watch("sample_type")}
              onValueChange={(value) => {
                setValue("sample_type", value);
                clearErrors("sample_type");
              }}
              disabled={loading || loadingDicts}
            >
              <SelectTrigger id="sample_type">
                <SelectValue placeholder="Chọn loại mẫu" />
              </SelectTrigger>
              <SelectContent>
                {sampleTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sample_type && (
              <p className="text-sm text-error">{errors.sample_type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="received_at">
                Ngày nhận <span className="text-error">*</span>
              </Label>
              <Input
                id="received_at"
                type="date"
                {...register("received_at")}
                disabled={loading}
              />
              {errors.received_at && (
                <p className="text-sm text-error">{errors.received_at.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="collected_at">Ngày lấy mẫu</Label>
              <Input
                id="collected_at"
                type="date"
                {...register("collected_at")}
                disabled={loading}
              />
              {errors.collected_at && (
                <p className="text-sm text-error">{errors.collected_at.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="technician">
              Kỹ thuật viên <span className="text-error">*</span>
            </Label>
            <Input
              id="technician"
              {...register("technician")}
              placeholder="Tên kỹ thuật viên"
              disabled={loading}
            />
            {errors.technician && (
              <p className="text-sm text-error">{errors.technician.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sl_mau">
              Số lượng mẫu <span className="text-error">*</span>
            </Label>
            <Input
              id="sl_mau"
              type="number"
              min="1"
              {...register("sl_mau")}
              disabled={loading}
            />
            {errors.sl_mau && (
              <p className="text-sm text-error">{errors.sl_mau.message}</p>
            )}
          </div>
        </div>

        {/* Section 3: Company Information */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary border-b pb-2">
            3. Thông tin công ty
          </h3>

          <div className="space-y-2">
            <Label htmlFor="company_name">
              Tên công ty <span className="text-error">*</span>
            </Label>
            <Input
              id="company_name"
              {...register("company_name")}
              placeholder="Tên công ty"
              disabled={loading}
            />
            {errors.company_name && (
              <p className="text-sm text-error">{errors.company_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="company_region">Khu vực</Label>
              <Input
                id="company_region"
                {...register("company_region")}
                placeholder="Khu vực"
                disabled={loading}
              />
              {errors.company_region && (
                <p className="text-sm text-error">{errors.company_region.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_province">Tỉnh/Thành phố</Label>
              <Input
                id="company_province"
                {...register("company_province")}
                placeholder="Tỉnh/Thành phố"
                disabled={loading}
              />
              {errors.company_province && (
                <p className="text-sm text-error">{errors.company_province.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Customer Information */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary border-b pb-2">
            4. Thông tin khách hàng
          </h3>

          <div className="space-y-2">
            <Label htmlFor="customer_name">
              Tên khách hàng <span className="text-error">*</span>
            </Label>
            <Input
              id="customer_name"
              {...register("customer_name")}
              placeholder="Tên khách hàng"
              disabled={loading}
            />
            {errors.customer_name && (
              <p className="text-sm text-error">{errors.customer_name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="customer_phone">Số điện thoại</Label>
              <Input
                id="customer_phone"
                type="tel"
                {...register("customer_phone")}
                placeholder="Số điện thoại"
                disabled={loading}
              />
              {errors.customer_phone && (
                <p className="text-sm text-error">{errors.customer_phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer_region">Khu vực</Label>
              <Input
                id="customer_region"
                {...register("customer_region")}
                placeholder="Khu vực"
                disabled={loading}
              />
              {errors.customer_region && (
                <p className="text-sm text-error">{errors.customer_region.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Pricing & Status */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary border-b pb-2">
            5. Giá & Trạng thái
          </h3>

          <div className="space-y-2">
            <Label htmlFor="price">
              Giá (VNĐ) <span className="text-error">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register("price")}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.price && (
              <p className="text-sm text-error">{errors.price.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">
              Danh mục <span className="text-error">*</span>
            </Label>
            <Select
              value={watch("category_id")}
              onValueChange={(value) => {
                setValue("category_id", value);
                clearErrors("category_id");
              }}
              disabled={loading || loadingDicts}
            >
              <SelectTrigger id="category_id">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-error">{errors.category_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái mẫu</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => {
                  setValue("status", value as SampleFormData["status"]);
                  clearErrors("status");
                }}
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nháp</SelectItem>
                  <SelectItem value="done">Hoàn thành</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-error">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_status">Trạng thái thanh toán</Label>
              <Select
                value={watch("billing_status")}
                onValueChange={(value) => {
                  setValue("billing_status", value as SampleFormData["billing_status"]);
                  clearErrors("billing_status");
                }}
                disabled={loading}
              >
                <SelectTrigger id="billing_status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Chưa thanh toán</SelectItem>
                  <SelectItem value="invoiced">Đã xuất hóa đơn</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="eom_credit">Công nợ cuối tháng</SelectItem>
                </SelectContent>
              </Select>
              {errors.billing_status && (
                <p className="text-sm text-error">{errors.billing_status.message}</p>
              )}
            </div>
          </div>

          {(watchBillingStatus === 'invoiced' || watchBillingStatus === 'eom_credit') && (
            <div className="space-y-2">
              <Label htmlFor="invoice_month">
                Tháng hóa đơn <span className="text-error">*</span>
              </Label>
              <Input
                id="invoice_month"
                type="month"
                {...register("invoice_month", {
                  setValueAs: (value) => value ? `${value}-01` : ""
                })}
                disabled={loading}
              />
              {errors.invoice_month && (
                <p className="text-sm text-error">{errors.invoice_month.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Section 6: Additional Notes */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-primary border-b pb-2">
            6. Ghi chú
          </h3>

          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Textarea
              id="note"
              {...register("note")}
              placeholder="Ghi chú thêm về mẫu này..."
              rows={3}
              disabled={loading}
            />
            {errors.note && (
              <p className="text-sm text-error">{errors.note.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white pb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading || loadingDicts}
            className="flex-1"
          >
            {loading ? "Đang lưu..." : sampleId ? "Cập nhật" : "Tạo mẫu"}
          </Button>
        </div>
      </form>
      )}
    </FormSheet>
  );
}
