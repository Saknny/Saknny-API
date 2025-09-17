import { EntityType } from "@src/modules/request/entities/enum/entityType.enum";

export class ImageResponse {
    id: string;
    entityType: EntityType;
    imageUrl: string;
  }
  
  export class BedResponse {
    bedId: string; // Only ID for bed
    bedImages: ImageResponse[]; // Only id, entityType, and imageUrl for bed images
  }
  
  export class RoomResponse {
    roomId: string; // Only ID for room
    roomImages: ImageResponse[]; // Only id, entityType, and imageUrl for room images
    beds: BedResponse[];
  }
  
  export class ApartmentImagesResponseDto {
    apartmentImages: ImageResponse[];
    rooms: RoomResponse[];
  }