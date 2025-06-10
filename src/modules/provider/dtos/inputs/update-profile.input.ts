import { IsEnum, IsOptional, IsPhoneNumber, IsString, IsUrl } from 'class-validator';
import 'reflect-metadata';



export class UpdateProviderProfileInput {


    @IsOptional()
    firstName: string;

    @IsOptional()
    lastName: string;

    @IsOptional()
    idCard: any;

    @IsOptional()
    image: any;

    @IsOptional()
    @IsString()
    gender: string;

    @IsOptional()
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
