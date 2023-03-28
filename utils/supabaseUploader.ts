import { BatchItem, FILE_STATES } from "@rpldy/shared";
import { SendMethod, SendResult } from "@rpldy/sender";
import { SupabaseClient } from "@supabase/supabase-js";

const validateItems = (items: BatchItem[]) => {
  if (items.length > 1) {
    throw new Error(
      "Uploady Supabase Storage Sender - only 1 file can be uploaded per request (use concurrent = 1)"
    );
  }

  if (!items[0].file) {
    throw new Error(
      "Uploady Supabase Storage Sender - uploaded item must be file"
    );
  }
};

export const supabaseStorageSender = ({
  supabase,
  fileName,
  fileNamePrefix,
  bucket,
}: {
  supabase: SupabaseClient;
  fileName?: string;
  fileNamePrefix?: string;
  bucket: string;
}) => {
  const process: SendMethod = (items: BatchItem[]) => {
    let result: SendResult = {
      request: new Promise((resolve, reject) => {
        try {
          validateItems(items);
          supabase.storage
            .from(bucket)
            .upload(
              fileName ??
                `${fileNamePrefix ? fileNamePrefix + "_" : ""}${
                  items[0].file.name
                }`,
              <Blob>(<unknown>items[0].file)
            )
            .then(({ data, error }) => {
              console.log({ data, error });
              if (data)
                resolve({
                  status: 200,
                  state: FILE_STATES.FINISHED,
                  response: {
                    ...data,
                    publicUrl: supabase.storage
                      .from(bucket)
                      .getPublicUrl(data.path).data.publicUrl,
                  },
                });
              if (error) reject(error);
            });
        } catch (error) {
          reject(error);
        }
      }),
      abort: () => false,
      senderType: "supabase-storage-sender",
    };

    return result;
  };

  return process;
};
