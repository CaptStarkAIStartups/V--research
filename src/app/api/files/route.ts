import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    files: data || [],
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();

    const uploadedFile = formData.get("file");
    const folderIdValue = formData.get("folder_id");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "No file was provided." },
        { status: 400 }
      );
    }

    const folderId =
      typeof folderIdValue === "string" &&
      folderIdValue.trim()
        ? folderIdValue
        : null;

    const fileExtension =
      uploadedFile.name.includes(".")
        ? uploadedFile.name.split(".").pop()
        : "file";

    const safeExtension = fileExtension
      ?.replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase() || "file";

    const uniqueName = `${crypto.randomUUID()}.${safeExtension}`;

    const storagePath = `${user.id}/${uniqueName}`;

    const arrayBuffer = await uploadedFile.arrayBuffer();

    const fileBuffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("research-files")
      .upload(storagePath, fileBuffer, {
        contentType:
          uploadedFile.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: savedFile, error: databaseError } =
      await supabase
        .from("files")
        .insert({
          user_id: user.id,
          folder_id: folderId,
          name: uploadedFile.name,
          file_type:
            uploadedFile.type || safeExtension,
          size: uploadedFile.size,
          storage_path: storagePath,
        })
        .select()
        .single();

    if (databaseError) {
      await supabase.storage
        .from("research-files")
        .remove([storagePath]);

      return NextResponse.json(
        { error: databaseError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        file: savedFile,
        message: "File uploaded successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Upload failed.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const fileId = body?.id;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required." },
        { status: 400 }
      );
    }

    const { data: file, error: findError } =
      await supabase
        .from("files")
        .select("*")
        .eq("id", fileId)
        .eq("user_id", user.id)
        .single();

    if (findError || !file) {
      return NextResponse.json(
        { error: "File not found." },
        { status: 404 }
      );
    }

    if (file.storage_path) {
      const { error: storageError } =
        await supabase.storage
          .from("research-files")
          .remove([file.storage_path]);

      if (storageError) {
        return NextResponse.json(
          { error: storageError.message },
          { status: 500 }
        );
      }
    }

    const { error: deleteError } =
      await supabase
        .from("files")
        .delete()
        .eq("id", fileId)
        .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Delete failed.",
      },
      { status: 500 }
    );
  }
}
