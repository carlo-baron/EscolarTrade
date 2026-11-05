"use server";
import { cloudinary } from "@/lib/cloudinary";

export async function uploadImage(imagePath: string){
	const options = {
		use_filename: true,
		unique_filname: true,
		overwrite: true
	};

	try {
		const result = await cloudinary.uploader.upload(imagePath, options);
		console.log(result);
		return result.public_id;
	} catch (error) {
		console.error(error);
	}
}
