import fs from 'fs';
import path from 'path';

// Hãy đảm bảo đường dẫn này là chính xác
const modelsDir = path.resolve(process.cwd(), 'src', 'models'); 
const outputFilePath = path.resolve(process.cwd(), 'schema.mmd');

async function generateMermaidERD() {
  let mermaidContent = 'erDiagram\n';
  const relationships = new Set(); // Dùng Set để tránh trùng lặp quan hệ
  const modelsData = new Map();

  if (!fs.existsSync(modelsDir)) {
    console.error(`Lỗi: Thư mục models không tồn tại tại đường dẫn: ${modelsDir}`);
    return;
  }

  const files = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));

  if (files.length === 0) {
    console.warn(`Không tìm thấy file model .js nào trong: ${modelsDir}`);
    return;
  }

  for (const file of files) {
    const modelPath = path.join(modelsDir, file);
    try {
      const fileUrl = new URL(`file:///${modelPath.replace(/\\/g, '/')}`).href;
      const module = await import(fileUrl);
      
      const model = module.default || module[Object.keys(module).find(key => key !== 'default')];

      if (model && model.modelName && model.schema) {
        const modelName = model.modelName;
        let modelBlock = `  ${modelName} {\n`;

        model.schema.eachPath((pathName, schemaType) => {
          if (pathName === '__v') return;

          // ===== THAY ĐỔI DUY NHẤT LÀ Ở ĐÂY =====
          let fieldName = pathName.replace(/\./g, '_'); // Sửa lỗi dấu chấm trong tên trường

          let type = schemaType.instance || 'Mixed'; 
          let attributes = [];

          if (schemaType.caster) {
            if (schemaType.caster.schema) {
                type = 'object[]';
            } else {
                type = `${schemaType.caster.instance || 'Mixed'}[]`;
            }
          } else if (schemaType.schema) {
            type = 'object';
          }
          
          if (fieldName === '_id' && type === 'ObjectID') {
             attributes.push('PK'); 
          }

          if (schemaType.options.required) {
            attributes.push('required');
          }
          if (schemaType.options.unique) {
            attributes.push('unique');
          }
          if (schemaType.options.ref) {
            const refModel = schemaType.options.ref;
            const relationshipSymbol = type.endsWith('[]') ? '}o--||' : '|o--||';
            relationships.add(`  ${refModel} ${relationshipSymbol} ${modelName} : "references"`);
            attributes.push(`FK to ${refModel}`);
          }

          modelBlock += `    ${type} ${fieldName}`;
          if (attributes.length > 0) {
            modelBlock += ` "(${attributes.join(', ')})"`;
          }
          modelBlock += '\n';
        });

        modelBlock += `  }\n`;
        modelsData.set(modelName, modelBlock);
      }
    } catch (error) {
      console.error(`Lỗi khi xử lý file ${file}:`, error);
    }
  }

  const sortedModelNames = Array.from(modelsData.keys()).sort();
  sortedModelNames.forEach(name => {
    mermaidContent += modelsData.get(name);
  });
  
  mermaidContent += '\n';

  relationships.forEach(rel => {
    mermaidContent += `${rel}\n`;
  });

  fs.writeFileSync(outputFilePath, mermaidContent);
  console.log(`\n✅ Mermaid ERD đã được tạo thành công tại: ${outputFilePath}`);
}

generateMermaidERD();