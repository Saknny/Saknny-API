import { IsEnum, IsOptional, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import 'reflect-metadata';



export class CompleteProviderProfileInput {

    idCard: any;

    @IsOptional()
    image: any;

    @IsPhoneNumber(null)
    phone: string;

    @IsOptional()
    @IsUrl()
    instagram: string;

    @IsOptional()
    @IsUrl()
    facebook: string;

    @IsOptional()
    @IsUrl()
    linkedin: string;
}
