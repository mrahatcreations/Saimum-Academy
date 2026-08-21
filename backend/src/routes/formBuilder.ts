import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

export const formBuilderRouter = Router();

// GET /api/form-builder/fields
formBuilderRouter.get('/fields', async (_req: Request, res: Response) => {
  try {
    const fields = await prisma.formFieldConfig.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    const formatted = fields.map(f => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : undefined
    }));

    res.json({ success: true, data: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/form-builder/fields — Bulk Save & Publish all fields
formBuilderRouter.put('/fields', async (req: Request, res: Response) => {
  try {
    const { fields } = req.body;

    if (!Array.isArray(fields)) {
      return res.status(400).json({ success: false, message: 'Fields array is required' });
    }

    // Atomic transaction: delete existing and recreate all fields
    // If any creation fails, the entire operation rolls back preserving original data
    await prisma.$transaction(async (tx) => {
      await tx.formFieldConfig.deleteMany();

      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        await tx.formFieldConfig.create({
          data: {
            id: f.id || `fld-${Date.now()}-${i}`,
            section: f.section,
            fieldName: f.fieldName,
            labelEn: f.labelEn,
            labelBn: f.labelBn || null,
            fieldType: f.fieldType,
            options: f.options ? JSON.stringify(f.options) : null,
            placeholder: f.placeholder || null,
            helpText: f.helpText || null,
            isEnabled: f.isEnabled !== undefined ? f.isEnabled : true,
            isRequired: f.isRequired !== undefined ? f.isRequired : false,
            isSystemField: f.isSystemField !== undefined ? f.isSystemField : false,
            sortOrder: i + 1
          }
        });
      }
    });

    const updated = await prisma.formFieldConfig.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    const formatted = updated.map(f => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : undefined
    }));

    res.json({ success: true, message: 'Form fields published successfully', data: formatted });
  } catch (error: any) {
    console.error('Error saving form fields:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
