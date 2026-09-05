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
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    folders: data || [],
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
    const body = await request.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const parentId =
      typeof body?.parent_id === "string" &&
      body.parent_id.trim()
        ? body.parent_id
        : null;

    if (!name) {
      return NextResponse.json(
        { error: "Folder name is required." },
        { status: 400 }
      );
    }

    const { data: folder, error } = await supabase
      .from("folders")
      .insert({
        user_id: user.id,
        name,
        parent_id: parentId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        folder,
        message: "Folder created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create folder.",
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
    const folderId = body?.id;

    if (!folderId) {
      return NextResponse.json(
        { error: "Folder ID is required." },
        { status: 400 }
      );
    }

    const { data: folder, error: findError } =
      await supabase
        .from("folders")
        .select("*")
        .eq("id", folderId)
        .eq("user_id", user.id)
        .single();

    if (findError || !folder) {
      return NextResponse.json(
        { error: "Folder not found." },
        { status: 404 }
      );
    }

    const { count: childCount } = await supabase
      .from("folders")
      .select("*", {
        count: "exact",
        head: true,
      })
      .eq("parent_id", folderId)
      .eq("user_id", user.id);

    if ((childCount || 0) > 0) {
      return NextResponse.json(
        {
          error:
            "This folder contains subfolders. Delete or move them first.",
        },
        { status: 409 }
      );
    }

    const { data: files } = await supabase
      .from("files")
      .select("storage_path")
      .eq("folder_id", folderId)
      .eq("user_id", user.id);

    const storagePaths =
      files
        ?.map((file) => file.storage_path)
        .filter(
          (path): path is string =>
            typeof path === "string" && path.length > 0
        ) || [];

    if (storagePaths.length > 0) {
      const { error: storageError } =
        await supabase.storage
          .from("research-files")
          .remove(storagePaths);

      if (storageError) {
        return NextResponse.json(
          { error: storageError.message },
          { status: 500 }
        );
      }
    }

    const { error: filesError } = await supabase
      .from("files")
      .delete()
      .eq("folder_id", folderId)
      .eq("user_id", user.id);

    if (filesError) {
      return NextResponse.json(
        { error: filesError.message },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from("folders")
      .delete()
      .eq("id", folderId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Folder deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete folder.",
      },
      { status: 500 }
    );
  }
}
