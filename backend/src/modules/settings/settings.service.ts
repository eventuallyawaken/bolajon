import { prisma } from '../../config/db.js';
import { NotFoundError } from '../../common/errors/AppError.js';

export const settingsService = {
  async getSettings(tenantId: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundError('Bog‘cha topilmadi');

    const features = (tenant.features as Record<string, any>) || {};

    return {
      orgName: tenant.name || 'Bolajon Ziyo MCHJ (Xususiy MTT)',
      stir: features.stir || '309876543',
      directorName: tenant.directorName || 'Dilnoza Murodova',
      phone: tenant.phone || '+998 90 123 45 67',
      email: tenant.email || 'info@bolajon-ziyo.uz',
      address: features.address || 'Toshkent sh., Chilonzor tumani, 9-mavze, 24-uy',
      monthlyFee: features.monthlyFee !== undefined ? Number(features.monthlyFee) : 1800000,
      bankAccount: features.bankAccount || '20208000900123456001',
      mfo: features.mfo || '00401',
      bankName: features.bankName || 'O‘zmilliybank Chilonzor filiali',
      smsNotificationsEnabled: features.smsNotificationsEnabled !== undefined ? Boolean(features.smsNotificationsEnabled) : true,
      morningCheckStrict: features.morningCheckStrict !== undefined ? Boolean(features.morningCheckStrict) : true,
      autoRemindDebtors: features.autoRemindDebtors !== undefined ? Boolean(features.autoRemindDebtors) : true,
    };
  },

  async updateSettings(tenantId: string, input: {
    orgName?: string;
    stir?: string;
    directorName?: string;
    phone?: string;
    email?: string;
    address?: string;
    monthlyFee?: number;
    bankAccount?: string;
    mfo?: string;
    bankName?: string;
    smsNotificationsEnabled?: boolean;
    morningCheckStrict?: boolean;
    autoRemindDebtors?: boolean;
  }) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundError('Bog‘cha topilmadi');

    const prevFeatures = (tenant.features as Record<string, any>) || {};
    const updatedFeatures = {
      ...prevFeatures,
      ...(input.stir !== undefined && { stir: input.stir }),
      ...(input.address !== undefined && { address: input.address }),
      ...(input.monthlyFee !== undefined && { monthlyFee: input.monthlyFee }),
      ...(input.bankAccount !== undefined && { bankAccount: input.bankAccount }),
      ...(input.mfo !== undefined && { mfo: input.mfo }),
      ...(input.bankName !== undefined && { bankName: input.bankName }),
      ...(input.smsNotificationsEnabled !== undefined && { smsNotificationsEnabled: input.smsNotificationsEnabled }),
      ...(input.morningCheckStrict !== undefined && { morningCheckStrict: input.morningCheckStrict }),
      ...(input.autoRemindDebtors !== undefined && { autoRemindDebtors: input.autoRemindDebtors }),
    };

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(input.orgName && { name: input.orgName }),
        ...(input.directorName && { directorName: input.directorName }),
        ...(input.phone && { phone: input.phone }),
        ...(input.email !== undefined && { email: input.email }),
        features: updatedFeatures,
      },
    });

    return {
      orgName: updated.name,
      stir: updatedFeatures.stir,
      directorName: updated.directorName || '',
      phone: updated.phone || '',
      email: updated.email || '',
      address: updatedFeatures.address,
      monthlyFee: Number(updatedFeatures.monthlyFee),
      bankAccount: updatedFeatures.bankAccount,
      mfo: updatedFeatures.mfo,
      bankName: updatedFeatures.bankName,
      smsNotificationsEnabled: updatedFeatures.smsNotificationsEnabled,
      morningCheckStrict: updatedFeatures.morningCheckStrict,
      autoRemindDebtors: updatedFeatures.autoRemindDebtors,
    };
  },
};
