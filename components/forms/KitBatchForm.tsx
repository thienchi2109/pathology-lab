"use client";

import { useState, useEffect } from "react";
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
import { KitType } from "@/types/database";

interface KitBatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  batch_code: string;
  kit_type_id: string;
  supplier: string;
  purchased_at: string;
  unit_cost: string;
  quantity: string;
  expires_at: string;
  note: string;
}

interface FormErrors {
  batch_code?: string;
  kit_type_id?: string;
  supplier?: string;
  purchased_at?: string;
  unit_cost?: string;
  quantity?: string;
  expires_at?: string;
}

export function KitBatchForm({
  open,
  onOpenChange,
  onSuccess,
}: KitBatchFormProps) {
  const { addToast } = useToast();
  const [kitTypes, setKitTypes] = useState<KitType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingKitTypes, setLoadingKitTypes] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    batch_code: "",
    kit_type_id: "",
    supplier: "",
    purchased_at: "",
    unit_cost: "",
    quantity: "",
    expires_at: "",
    note: "",
  });

  // Load kit types on mount
  useEffect(() => {
    async function loadKitTypes() {
      try {
        const response = await fetch("/api/dicts/kit-types");
        if (!response.ok) throw new Error("Failed to load kit types");
        const result = await response.json();
        setKitTypes(result.data || []);
      } catch (error) {
        console.error("Error loading kit types:", error);
        addToast({
          message: "Không thể tải danh sách loại kit",
          variant: "error",
        });
      } finally {
        setLoadingKitTypes(false);
      }
    }

    if (open) {
      loadKitTypes();
    }
  }, [open, addToast]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setFormData({
        batch_code: "",
        kit_type_id: "",
        supplier: "",
        purchased_at: "",
        unit_cost: "",
        quantity: "",
        expires_at: "",
        note: "",
      });
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.batch_code.trim()) {
      newErrors.batch_code = "Mã lô không được để trống";
    }

    if (!formData.kit_type_id) {
      newErrors.kit_type_id = "Vui lòng chọn loại kit";
    }

    if (!formData.supplier.trim()) {
      newErrors.supplier = "Nhà cung cấp không được để trống";
    }

    if (!formData.purchased_at) {
      newErrors.purchased_at = "Ngày mua không được để trống";
    }

    if (!formData.unit_cost || parseFloat(formData.unit_cost) <= 0) {
      newErrors.unit_cost = "Đơn giá phải lớn hơn 0";
    }

    const quantity = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(quantity) || quantity < 1) {
      newErrors.quantity = "Số lượng phải ≥ 1";
    } else if (quantity > 100) {
      newErrors.quantity = "Số lượng quá lớn (tối đa 100)";
    }

    if (formData.expires_at && formData.purchased_at) {
      const purchasedDate = new Date(formData.purchased_at);
      const expiresDate = new Date(formData.expires_at);
      if (expiresDate <= purchasedDate) {
        newErrors.expires_at = "Ngày hết hạn phải sau ngày mua";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast({
        message: "Vui lòng kiểm tra lại thông tin",
        variant: "error",
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        batch_code: formData.batch_code.trim(),
        kit_type_id: formData.kit_type_id,
        supplier: formData.supplier.trim(),
        purchased_at: formData.purchased_at,
        unit_cost: parseFloat(formData.unit_cost),
        quantity: parseInt(formData.quantity),
        expires_at: formData.expires_at || null,
        note: formData.note.trim() || null,
      };

      const response = await fetch("/api/kits/bulk-create", {
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
        message: `Đã tạo ${result.data.count} kit từ lô ${formData.batch_code}`,
        variant: "success",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating kit batch:", error);
      const errorMessage = error instanceof Error ? error.message : "Không thể tạo lô kit";
      addToast({
        title: "Lỗi",
        message: errorMessage,
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Tạo lô kit mới"
      description="Nhập thông tin lô kit và số lượng cần tạo (tối đa 100)"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Batch Code */}
        <div className="space-y-2">
          <Label htmlFor="batch_code">
            Mã lô <span className="text-error">*</span>
          </Label>
          <Input
            id="batch_code"
            value={formData.batch_code}
            onChange={(e) => handleInputChange("batch_code", e.target.value)}
            placeholder="Ví dụ: LOT-2024-001"
            disabled={loading}
          />
          {errors.batch_code && (
            <p className="text-sm text-error">{errors.batch_code}</p>
          )}
        </div>

        {/* Kit Type */}
        <div className="space-y-2">
          <Label htmlFor="kit_type_id">
            Loại kit <span className="text-error">*</span>
          </Label>
          <Select
            value={formData.kit_type_id}
            onValueChange={(value) => handleInputChange("kit_type_id", value)}
            disabled={loading || loadingKitTypes}
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
            <p className="text-sm text-error">{errors.kit_type_id}</p>
          )}
        </div>

        {/* Supplier */}
        <div className="space-y-2">
          <Label htmlFor="supplier">
            Nhà cung cấp <span className="text-error">*</span>
          </Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => handleInputChange("supplier", e.target.value)}
            placeholder="Tên nhà cung cấp"
            disabled={loading}
          />
          {errors.supplier && (
            <p className="text-sm text-error">{errors.supplier}</p>
          )}
        </div>

        {/* Purchased At */}
        <div className="space-y-2">
          <Label htmlFor="purchased_at">
            Ngày mua <span className="text-error">*</span>
          </Label>
          <Input
            id="purchased_at"
            type="date"
            value={formData.purchased_at}
            onChange={(e) => handleInputChange("purchased_at", e.target.value)}
            disabled={loading}
          />
          {errors.purchased_at && (
            <p className="text-sm text-error">{errors.purchased_at}</p>
          )}
        </div>

        {/* Unit Cost */}
        <div className="space-y-2">
          <Label htmlFor="unit_cost">
            Đơn giá (VNĐ) <span className="text-error">*</span>
          </Label>
          <Input
            id="unit_cost"
            type="number"
            step="0.01"
            min="0"
            value={formData.unit_cost}
            onChange={(e) => handleInputChange("unit_cost", e.target.value)}
            placeholder="0.00"
            disabled={loading}
          />
          {errors.unit_cost && (
            <p className="text-sm text-error">{errors.unit_cost}</p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">
            Số lượng <span className="text-error">*</span>
          </Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            max="100"
            value={formData.quantity}
            onChange={(e) => handleInputChange("quantity", e.target.value)}
            placeholder="1-100"
            disabled={loading}
          />
          {errors.quantity && (
            <p className="text-sm text-error">{errors.quantity}</p>
          )}
          <p className="text-xs text-text-secondary">
            Tối đa 100 kit mỗi lô
          </p>
        </div>

        {/* Expires At */}
        <div className="space-y-2">
          <Label htmlFor="expires_at">Ngày hết hạn</Label>
          <Input
            id="expires_at"
            type="date"
            value={formData.expires_at}
            onChange={(e) => handleInputChange("expires_at", e.target.value)}
            disabled={loading}
          />
          {errors.expires_at && (
            <p className="text-sm text-error">{errors.expires_at}</p>
          )}
        </div>

        {/* Note */}
        <div className="space-y-2">
          <Label htmlFor="note">Ghi chú</Label>
          <Textarea
            id="note"
            value={formData.note}
            onChange={(e) => handleInputChange("note", e.target.value)}
            placeholder="Ghi chú thêm về lô kit này..."
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
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
            disabled={loading || loadingKitTypes}
            className="flex-1"
          >
            {loading ? "Đang tạo..." : "Tạo lô kit"}
          </Button>
        </div>
      </form>
    </FormSheet>
  );
}
