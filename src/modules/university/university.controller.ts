import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UniversityService } from './university.service';

@Controller('university')
export class UniversityController {
  constructor(private readonly universityService: UniversityService) {}

  // ---------- UNIVERSITY ----------

@Get()
async getAllUniversities() {
  const universityNames = await this.universityService.getAllUniversities();
  return  {
      universities: universityNames
    }
  ;
}

  @Post()
  createUniversity(@Body('name') name: string) {
    return this.universityService.createUniversity(name);
  }

  @Patch(':id')
  updateUniversity(@Param('id') id: string, @Body('name') name: string) {
    return this.universityService.updateUniversity(id, name);
  }

  @Delete(':id')
  deleteUniversity(@Param('id') id: string) {
    return this.universityService.deleteUniversity(id);
  }

  // ---------- MAJOR ----------

@Get(':name/majors')
async getMajors(@Param('name') universityname: string) {
  const majors = await this.universityService.getMajorsByUniversity(universityname);
  return { majors:majors };
}

  @Post(':id/majors')
  createMajor(@Param('id') universityId: string, @Body('name') name: string) {
    return this.universityService.createMajor(universityId, name);
  }

  @Patch('majors/:id')
  updateMajor(@Param('id') id: string, @Body('name') name: string) {
    return this.universityService.updateMajor(id, name);
  }

  @Delete('majors/:id')
  deleteMajor(@Param('id') id: string) {
    return this.universityService.deleteMajor(id);
  }

  // ---------- LEVEL ----------

  @Get('majors/:name/levels')
  async getLevelsByMajorName(@Param('name') majorName: string) {
    const levels = await this.universityService.getLevelsByMajorName(majorName);
    return {
      
        levels: levels
      
    };
  }
  @Post('majors/:id/levels')
  createLevel(@Param('id') majorId: string, @Body('name') name: string) {
    return this.universityService.createLevel(majorId, name);
  }

  @Patch('levels/:id')
  updateLevel(@Param('id') id: string, @Body('name') name: string) {
    return this.universityService.updateLevel(id, name);
  }

  @Delete('levels/:id')
  deleteLevel(@Param('id') id: string) {
    return this.universityService.deleteLevel(id);
  }
}
