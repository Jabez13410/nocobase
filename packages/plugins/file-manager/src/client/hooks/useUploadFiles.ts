import { useBlockRequestContext } from '@nocobase/client';
import { notification } from 'antd';
import { useFmTranslation } from '../locale';

// 限制上传文件大小为 10M
export const FILE_LIMIT_SIZE = 10 * 1024 * 1024;

export const useUploadFiles = () => {
  const { service } = useBlockRequestContext();
  const { t } = useFmTranslation();
  const uploadingFiles = {};

  let pendingNumber = 0;

  return {
    /**
     * 返回 false 会阻止上传，返回 true 会继续上传
     */
    beforeUpload(file) {
      if (file.size > FILE_LIMIT_SIZE) {
        notification.error({
          message: `${t('File size cannot exceed')} ${FILE_LIMIT_SIZE / 1024 / 1024}M`,
        });
        file.status = 'error';
        return false;
      }
      return true;
    },
    onChange(fileList) {
      fileList.forEach((file) => {
        if (file.status === 'uploading' && !uploadingFiles[file.uid]) {
          pendingNumber++;
          uploadingFiles[file.uid] = true;
        }
        if (file.status === 'done' && uploadingFiles[file.uid]) {
          delete uploadingFiles[file.uid];
          if (--pendingNumber === 0) {
            service?.refresh?.();
          }
        }
      });
    },
  };
};
